# RestaurantApp

# Description of the app

This is an app that has 2 purposes:

- if you are a potential customer visiting the website, you can see the menu of the restaurant and contact them.

- if you are the restaurant owner, you can:
  - create an account
  - update your menu whenever it changes
  - register your various recipes, stock updates and sales
    This allows you to:
  - have access to a database with all your recipes
  - keep track of your stock and see which products to repurchase
  - update your menu for your customers to see

# Launch the app

From the root folder, launch the appication with: flask --app main run

# Configuration file

Create a ".env.private" file in the "website" folder with the following variables:
SECRET_KEY = 'your secretkey'
MAIL_USERNAME = 'your email adress' --> to send an email from the contact page
MAIL_PASSWORD = 'your password' --> to send an email from the contact page

# Commments

- Unit management could be handled via config file, or even more user-friendly from the user interface
- Stock page: when modifying the stock, the input and "register" button could be linked so that clicking on enter works to register the modification.
- Responsivity: Some pages of the website are not mobile friendly enough:
  - Recipes page: the display of the ingredients in a recipe
  - Stock page: the tables displaying the stocks
    I could also work on a more responsive font size.
- Further work of factorization could be done

# NB

You can enter a recipe with no ingredient, I just won't affect your stock if you enter a sale.
