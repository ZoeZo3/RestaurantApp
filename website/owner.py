from flask import Blueprint, render_template, request, flash, jsonify
from flask_login import login_required, current_user
from .models import Ingredient, IngredientSchema, Recipe, RecipeSchema, IngredientByRecipe, Stock
from . import db, owner, ma
import json
from werkzeug.utils import secure_filename
import os

owner = Blueprint("owner", __name__)


@owner.route("/", methods=["POST", "GET"])
@login_required
def home():
    return render_template("owner/home.html", user=current_user)

@owner.route("/menu", methods=["POST", "GET"])
@login_required
def menu():
    if request.method == 'POST':
        file = request.files["file-upload"]
        if file.filename == "":
            flash("Vous n'avez pas sélectionné de fichier.", category="error")
        else:
            file.save(os.path.join(os.path.abspath(os.path.dirname(__file__)),"static/menu",secure_filename("menu.png")))
            flash("Menu mis à jour !", category="success")
        
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
                flash("Une recette avec le même nom existe déjà.", category="error")
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
    Recipe.query.filter_by(id=recipe["id"], user_id=current_user.id).delete()
   
    # Delete ingredients in the recipe from Ingredient_by_recipe table
    IngredientByRecipe.query.filter_by(recipe_id=recipe["id"]).delete()
    db.session.commit()
    print("Recipe deleted")
    return jsonify({})

@owner.route("/sales")
@login_required
def sales():
    recipes_list = Recipe.query.filter_by(user_id=current_user.id)
    recipe_schema = RecipeSchema(many=True)
    output = recipe_schema.dump(recipes_list)
    return render_template("owner/sales.html", user=current_user, recipes_list=output)

@owner.route("/stock", methods=["GET", "POST"])
@login_required
def stock():
    if request.method == "POST":
        ingredient_id = request.form.get("ingredient")
        quantity = float(request.form.get("quantity"))
    
        stock_ingredient = Stock.query.filter_by(id=ingredient_id, user_id=current_user.id).first()
        if stock_ingredient:
            stock_ingredient.quantity += quantity
        else:
            new_stock_ingredient = Stock(id=ingredient_id, quantity=quantity, user_id = current_user.id)
            db.session.add(new_stock_ingredient)
        db.session.commit()
        
    # get all registred ingredients
    ingredients_list = Ingredient.query.filter_by(user_id=current_user.id).order_by("name")
    ingredients_schema = IngredientSchema(many=True)
    output = ingredients_schema.dump(ingredients_list)

    # get stock data
    stock = db.session.query(Stock.id, Ingredient.name, Ingredient.unit, Stock.quantity)\
        .filter(Stock.user_id==current_user.id)\
        .filter(Stock.id==Ingredient.id).filter(Stock.user_id==Ingredient.user_id)\
        .all()

    # display page
    return render_template("owner/stock.html", user=current_user, ingredients_list=output, stock=stock)

@owner.route("/update-stock", methods=["POST"])
def updateStock():
    stock = json.loads(request.data)
    Stock.query.filter_by(id=stock["id"], user_id=current_user.id).update({'quantity': stock["quantity"] })
    db.session.commit()
    print("stock updated")
    return jsonify({})
