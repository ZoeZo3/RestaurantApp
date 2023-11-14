const units = [
    {name: "Grammes", value: "g"},
    {name: "Kilogrammes", value: "kg"},
    {name: "Litres", value: "L"},
    {name: "Millilitres", value: "mL"},
    {name: "Cuillère", value: "cuillère"},
    {name: "Pincée", value: "pincée"},
    {name: "Unité", value: "unité"}
];

function createModalNewIngredient(modal_div) {
    // Modal div to open a popup when registreing new element
    var unitOptions = "";
    for (var i = 0; i < units.length; i++) {
        unitOptions += (`<option value=${units[i].value}>${toTitleCase(units[i].name)}</option>`);
    }

    modal_div.innerHTML = (`
        <div class="modal-dialog modal-content" role="document">
            <div class="modal-header">
              <h5 class="modal-title" id="regsiterIngredient">Enregistrer un ingrédient</h5>
              <button type="button" class="close close-modal-ingredient" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
                <form>
                    <div class="row row-modal">
                        <div>
                            <input type="text" class="form-control" id="ingredient" name="ingredient" placeholder="Nom" required>
                        </div>
                        <div>
                            <select type="text" class="form-control" id="unit" name="unit" placeholder="Unité" required>
                                <option value="" disabled selected hidden>Unité</option>
                                ${unitOptions}
                            </select>
                        </div>
                    </div>
                    <div class="alert alert-warning alert-modal-incomplete" role="alert" style="display: none;">
                        Merci d'entrer un nom et une unité.
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div> 
                    <div class="alert alert-warning alert-modal-exists" role="alert" style="display: none;">
                        Cet ingrédient existe déjà.
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>                  
                    <div class="footer-btn">
                        <button type="button" class="btn btn-dark btn-add-ingredient-to-database" onclick="addIngredientToDatabase()">Enregistrer</button>
                    </div>           
                </form>
            </div>
        </div>
    `)
}

function addNewRow(list_str, div_id, type) {
    list = JSON.parse(list_str);
    // select the div where to append a new line
    div_to_append = $("#" + div_id)[0];

    // get the id of the new line by adding one to the id of the last line if adding a new line from the button
    nb_of_elements = div_to_append.getElementsByTagName("select").length;
    // if it is the first row, id = 1
    if (nb_of_elements == 0) {
        id = 1;
    }
    // else get the id of the last element and add one (necessary in case some rows prior where deleted)
    else {
        id = (parseInt(div_to_append.getElementsByTagName("select")[nb_of_elements - 1].id.split("_")[1]) + 1).toString();
    }

    // if adding to the modal, state it in the id
    if (div_id.indexOf("modal") != -1){
        id += "_modal";
    }

    // create the new div
    var new_div = document.createElement("div");
    var options = "";
    for (var i = 0; i < list.length; i++) {
        options += (`<option class='${type}_option' value=${list[i].id}>${toTitleCase(list[i].name)}</option>`);
    }
    
    // append the correct elements according to the type of page (eg: recipe or ingredient)
    if (type == "ingredient") {
        new_div.innerHTML = ingredientRow(id, options, "", list);
    } else if (type == "recipe") {
        new_div.innerHTML = recipeRow(id, options);
    } else if (type.indexOf("menuRecipe") > -1) {
        new_div.innerHTML = menuRecipeRow(id, options, type);
    } else if (type == "ingredientModal") {
        new_div.innerHTML = ingredientRow(id, options, "Modal", list);
    }
    
    // append it to the div
    div_to_append.appendChild(new_div);

    // refresh to display the new selector
    $(`#${type}_${id}`).selectpicker('refresh');
}

function ingredientRow(id, options, type, list) {
    return (`
        <div class="row">
            <div style="width: 40%">
                <select type="text" id="ingredient${type}_${id}" name="ingredient${type}_${id}" class="form-control selectpicker selectpicker-ingredient${type}_${id}" data-live-search="true" onchange="ingredientSelectUpdate(this, ${JSON.stringify(list).replaceAll("\"", "\'")})" title="Sélectionner un ingrédient" required>
                    <option value="add"
                        data-content='<span class="btn btn-link btn-add-ingredient" data-toggle="modal" data-target="modalForIngredient">
                            <i class="fas fa-plus add_icon"></i> Ajouter un nouvel élément</span>'>
                    </option>`
                    + options +
                `</select>
            </div>
            <div style="width: 20%">
                <input type="number" id="quantity${type}_${id}" name="quantity${type}_${id}" min="0.1" step="0.1" class="form-control" placeholder="Quantité" required></input>
            </div>
            <div class="unit" style="width: 20%">
                <label type="text" id="unit${type}_${id}" name="unit${type}_${id}">-</input>
            </div>
            <button class="close" type="button" onclick="deleteRow(this)">
                <span>&times;</span>
            </button>
        </div>
    `)
}

function recipeRow(id, options) {
    return (`
    <div class="row">
        <div style="width: 37%">
            <select type="text" id="recipe_${id}" name="recipe_${id}" class="form-control selectpicker selectpicker-recipe_${id}" data-live-search="true" title="Sélectionner une recette" required>
                ${options}
            </select>
        </div>
        <div style="width: 20%">
            <input type="number" id="quantity_${id}" name="quantity_${id}" min="0.1" step="0.1" class="form-control" placeholder="Quantité" required></input>
        </div>
        <button class="close" type="button" onclick="deleteRow(this)">
            <span>&times;</span>
        </button>
    </div>
    `)
}

function menuRecipeRow(id, options, type) {
    return (`
    <div class="row">
        <div style="width: 37%">
            <select type="text" id="${type}_${id}" name="${type}_${id}" class="form-control selectpicker selectpicker-${type}_${id}" data-live-search="true" title="Sélectionner une recette" required>
                ${options}
            </select>
        </div>
        <button class="close" type="button" onclick="deleteRow(this)">
            <span>&times;</span>
        </button>
    </div>
    `)
}

function addRecipeForm(type) {
    div = document.getElementById(`bodyRecipe${type}`);
    div.innerHTML =(
    `<form id="addRecipe${type}" name="addRecipe${type}" method="POST">
    <div class="row" style="margin-bottom: 40px;"">
        <input type="text" id="name${type}" name="name${type}" class="form-control recipe-header" placeholder="Nom" required>
        <input type="text" id="description${type}" name="description${type}" class="form-control recipe-header" placeholder="Descriptif" required>
    </div>
    <div class="row" style="margin-bottom: 10px;">
        <div class="form-header" style="width: 40%">Ingrédient</div>
        <div class="form-header" style="width: 20%">Quantité</div>
        <div class="form-header" style="width: 20%">Unité</div>
        <div style="width: 5%"></div>
    </div>   
    <div id="ingredientsList${type}">  
    </div> 
    <div class="row">
        <button class="btn btn-light" type="button" id="addRowButton${type}"><i class="fas fa-plus add_icon"></i> Ajouter un ingrédient</button>
    </div>
    
    <div align="center">
        <button type="submit" name="registerRecipe${type}" class="btn btn-dark">Ajouter la recette</button>
    </div>
    </form>`);
}

// delete an ingredient from the recipe creation form
function deleteRow(row) {
    row.parentElement.remove();
    console.log("Row removed.");
}

// update the modal to update recipe, and make it pop up
function updateRecipeModal(recipe_ingredients_dict) {
    console.log(recipe_ingredients_dict)
    // simluate click on the modal activator button
    $("#buttonForModalUpdateRecipe")[0].click();

    // remove all existing ingredient rows from the modal / querySelectorAll to get a static selection to be able to remove
    var existing_lines = $("#ingredientsListModal")[0].querySelectorAll(".close")
    for (line=0; line<existing_lines.length; line++){
        deleteRow(existing_lines[line])
    }
    
    // import recipe's name and description in the input fields
    $("#nameModal")[0].value = recipe_ingredients_dict.name
    $("#descriptionModal")[0].value = recipe_ingredients_dict.description

    // create input fileds for each ingredient of the recipe
    for (i in recipe_ingredients_dict.ingredients) {
        var ingredient = recipe_ingredients_dict.ingredients[i]
        console.log(ingredient)
        addNewRow(TODO)
    }

    /*
    // create input fileds for each ingredient of the recipe
    for (i=0; i<recipe_ingredients_dict.ingredients.length; i++) {
        id = (i+1).toString()
        addNewIngredientRow(ingredients_list, "ingredients_list_modal", id)
        // import current recipe's ingredient and quantity
        $("#ingredient_"+ id +"_modal")[0].value = recipe_ingredients_dict.ingredients[i].id
        $("#ingredient_"+ id +"_modal").selectpicker('refresh')
        $("#quantity_"+ id +"_modal")[0].value = recipe_ingredients_dict.ingredients[i].quantity
        $("#unit_"+ id +"_modal")[0].innerHTML = recipe_ingredients_dict.ingredients[i].unit
    }

    // simluate click on the modal activator button
    $("#buttonForModalUpdateRecipe")[0].click();*/
}

function createStockAccordion(div_to_append, stock, condition) {
    stock_list = JSON.parse(stock);

    var items_list = "";
    for (i in stock_list) {
        item = stock_list[i];
        if (eval(item.quantity + condition)) {
            var new_item_unit = item.unit;
            if ((new_item_unit === "unité" | new_item_unit === "pincée" | new_item_unit === "cuillère") && Math.abs(item.quantity) > 1) {
                new_item_unit += 's';
            }
            var new_item_quantity = Math.round(item.quantity * 10) / 10;
            var new_item = `
                <li id="item_${ item.id }" class="stock-item-line">
                    <div class="stock-item-line--section stock-item-section--name">${ item.name }</div>
                    <div class="stock-item-line--section quantity">${new_item_quantity}</div>
                    <div class="stock-item-line--section">${ new_item_unit }</div>
                    <div class="stock-item-line--section stock-item-section--buttons">
                        <button type="button" class="btn btn-light stock-btn--update" onclick="updateStock(this)">
                            Modifier
                        </button>
                        <button type="button" class="btn btn-green stock-btn--save" onclick="saveStock(this)">
                            Enregistrer
                        </button>
                        <p class="stock-item-line-quantity--alert">Merci d'entrer un chiffre avec au plus 1 décimale.</p>
                    </div>
                </li>`;
            items_list += new_item;
        }
    }
    
    div_to_append.innerHTML = (`
    <ul class="list-group stocks-listing">
            <li class="stock-item-line stock-item-header">
                <div class="stock-item-line--section stock-title stock-item-section--name">Ingrédient</div>
                <div class="stock-item-line--section stock-title">Quantité</div>
                <div class="stock-item-line--section stock-title">Unité</div>
                <div class="stock-item-line--section stock-title stock-item-section--buttons"></div>
            </li>
            ${items_list}
        </ul>
    </div>
    `);
}
