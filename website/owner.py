from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from .models import Ingredient, IngredientSchema, Recipe, RecipeSchema, IngredientByRecipe
from . import db, owner, ma
import json
from flask_mail import Message

owner = Blueprint("owner", __name__)


@owner.route("/", methods=["POST", "GET"])
@login_required
def home():
    return render_template("owner/home.html", user=current_user)

@owner.route("/menu")
@login_required
def menu():
    recipes_list = Recipe.query.filter_by(user_id=current_user.id)
    recipe_schema = RecipeSchema(many=True)
    output = recipe_schema.dump(recipes_list)
    return render_template("owner/menu.html", user=current_user, recipes_list=output)
    
@owner.route("/recipes", methods=["GET", "POST"])
@login_required
def recipes():
    if request.method == "POST":
        #if the form sent is the one to add new recipe
        if "register-recipe" in request.form:
            name = request.form.get("name").lower()
            #check if recipe already exists
            recipe = Recipe.query.filter_by(name=name).first()
            if recipe:
                flash("This recipe already exists.", category="error")
            else:
                description = request.form.get("description")
                #retrieve ingredients and their quantities in a list of dicts
                nb_ingredients = int((len(request.form) - 2) / 2)
                ingredients = []
                for i in range(nb_ingredients):
                    if request.form.get("ingredient_" + str(i + 1)) != "add":
                        ingredients.append({
                            "id": request.form.get("ingredient_" + str(i + 1)),
                            "quantity": request.form.get("quantity_" + str(i + 1))
                        })
                #add recipe to the database
                new_recipe = Recipe(name=name, description=description, user_id = current_user.id)
                db.session.add(new_recipe)
                db.session.commit()
                print("Recipe added")
                #add ingredients of the recipe to the database
                for ingredient in ingredients:
                    new_ingredient_recipe = IngredientByRecipe(id=ingredient["id"], quantity=ingredient["quantity"], recipe_id=new_recipe.id)
                    db.session.add(new_ingredient_recipe)
                    db.session.commit()
                    print("Ingredient added")
                flash("Recette ajoutée !", category="success")
        # if the form sent is the one to update recipes
        elif "update-recipe" in request.form:
            id = request.form.get("id")
            name = request.form.get("name").lower()
            description = request.form.get("description")
            #retrieve ingredients and their quantities in a list of dicts
            ids = []
            for element in request.form:
                if "ingredient_" in element:
                    ids.append(element.split("_")[1])
            ingredients = []
            for i in ids:
                if request.form.get("ingredient_" + str(i)+ "_modal") != "add":
                    ingredients.append({
                        "id": request.form.get("ingredient_" + str(i) + "_modal"),
                        "quantity": request.form.get("quantity_" + str(i) + "_modal")
                    })
            # update recipe
            Recipe.query.filter_by(user_id=current_user.id, id=id)\
                    .update({'name': name, "description": description})
            db.session.commit()
            # update ingredients
            previous_ingredients = IngredientByRecipe.query.filter_by(recipe_id=id).all()
            for ingredient in ingredients:
                line = IngredientByRecipe.query.filter_by(recipe_id=id, id=ingredient["id"]).first()
                if line:
                    IngredientByRecipe.query.filter_by(recipe_id=id, id=ingredient["id"])\
                        .update({"quantity": ingredient["quantity"]})
                    previous_ingredients.remove(line)
                else:
                    new_ingredient = IngredientByRecipe(id=ingredient["id"], quantity=ingredient["quantity"], recipe_id=id)
                    db.session.add(new_ingredient)
                    db.session.commit()
            for ingredient_to_remove in previous_ingredients:
                IngredientByRecipe.query.filter_by(recipe_id=id, id=ingredient_to_remove.id).delete()
            db.session.commit()
         
    # get all registred ingredients
    ingredients_list = Ingredient.query.filter_by(user_id=current_user.id).order_by("name")
    ingredients_schema = IngredientSchema(many=True)
    output = ingredients_schema.dump(ingredients_list)
    
    # get all registred recipes
    recipes = Recipe.query.filter_by(user_id=current_user.id)

    # get all ingredients for recipes
    ingredients_by_recipe = db.session.query(Ingredient.id, Ingredient.name, Ingredient.unit, IngredientByRecipe.quantity, IngredientByRecipe.recipe_id)\
        .join(Recipe)\
        .filter(Recipe.id==IngredientByRecipe.recipe_id).filter(Recipe.user_id==current_user.id)\
        .join(Ingredient).filter(Ingredient.id==IngredientByRecipe.id).all()

    #display page
    return render_template("owner/recipes.html", user=current_user, ingredients_list=output, recipes=recipes, ingredients_by_recipe=ingredients_by_recipe)

@owner.route("/register-ingredient", methods=["POST"])
@login_required
def register_ingredient():
    data = json.loads(request.data)
    name = data["name"].lower()
    unit = data["unit"]
    line = data["line"]
    # check if the user already has registrered this ingredient
    ingredient = Ingredient.query.filter_by(name=name, user_id=current_user.id).first()
    if ingredient:
        return jsonify({"status": "fail", "name": name, "unit": unit, "line": line, "id": ingredient.id})
    else:
        new_ingredient = Ingredient(name=name, unit=unit, user_id = current_user.id)
        db.session.add(new_ingredient)
        db.session.commit()
        print("Ingredient added.")
        ingredient = Ingredient.query.filter_by(name=name, user_id=current_user.id).first()
        return jsonify({"status": "success", "name": name, "unit": unit, "line": line, "id": ingredient.id})


@owner.route("/delete-recipe", methods=["POST"])
def deleteRecipe():
    recipe = json.loads(request.data)
    # Delete recipe from the Recipe table
    Recipe.query.filter_by(id=recipe["recipeID"], user_id=current_user.id).delete()
   
    # Delete ingredients in the recipe from Ingredient_by_recipe table
    IngredientByRecipe.query.filter_by(recipe_id=recipe["recipeID"]).delete()
    db.session.commit()
    return jsonify({})

@owner.route("/sales")
@login_required
def sales():
    recipes_list = Recipe.query.filter_by(user_id=current_user.id)
    recipe_schema = RecipeSchema(many=True)
    output = recipe_schema.dump(recipes_list)
    return render_template("owner/sales.html", user=current_user, recipes_list=output)
