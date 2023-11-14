from . import db, ma
from flask_login import UserMixin
from sqlalchemy.sql import func  

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))

class Ingredient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    unit = db.Column(db.String(100))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class IngredientSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Ingredient
        include_fk = True

class Recipe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150))
    description = db.Column(db.String(10000))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class RecipeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Recipe
        include_fk = True

class IngredientByRecipe(db.Model):
    line = db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, db.ForeignKey('ingredient.id'))
    quantity = db.Column(db.Float)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'))

class IngredientByRecipeSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Recipe
        include_fk = True

class Stock(db.Model):
    line = db.Column(db.Integer, primary_key=True)
    id = db.Column(db.Integer, db.ForeignKey('ingredient.id'))
    quantity = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class StockSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Stock
        include_fk = True

class Sales(db.Model):
    line = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'))
    quantity = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class SalesSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Stock
        include_fk = True