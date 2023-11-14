// capitalize names
function toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}

// delete recipe from databases
function deleteRecipe(id) {
    fetch("delete-recipe", {
        method: "POST",
        body: JSON.stringify({id: id})
        } 
    ).then((_res) => {
        window.location.href = "recipes";
    });
}

// update the modal to update recipe, and make it pop up
function updateRecipe(id, ingredients_list, recipe_ingredients_dict) {
    console.log(id)
    console.log(recipe_ingredients_dict)
    // update the modal
    // remove all existing ingredient rows from the modal / querySelectorAll to get a static selection to be able to remove
    var existing_lines = $("#ingredients_list_modal")[0].querySelectorAll(".close")
    for (line=0; line<existing_lines.length; line++){
        deleteRow(existing_lines[line])
    }

    // import recipe's id, name and description in the input fields
    $("#id_modal")[0].value = recipe_ingredients_dict.id
    $("#name_modal")[0].value = recipe_ingredients_dict.name
    $("#description_modal")[0].value = recipe_ingredients_dict.description

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
    $("#button-for-modal-update-recipe")[0].click();
}

// delete an ingredient from the recipe creation form
function deleteRow(row) {
    row.parentElement.parentElement.remove();
    console.log("Row removed.");
}

// add a line for an ingredient in the recipe creation form
function addNewIngredientRow(ingredients_list, div_id, id) {
    console.log(div_id)
    // select the div where to append a new line
    div_to_append = $("#" + div_id)[0];

    // get the id of the new line by adding one to the id of the last line if adding a new line from the button
    if (id === undefined){
        console.log(div_to_append)
        nb_of_ingredients = div_to_append.getElementsByTagName("select").length;
        // if it is the first ingredient row, id = 1
        if (nb_of_ingredients == 0) {
            id = 1
        }
        // else get the id of the last ingredient and add one (necessary in case some ingredients prior where deleted)
        else {
            id = (parseInt(div_to_append.getElementsByTagName("select")[nb_of_ingredients - 1].id.split("_")[1]) + 1).toString();
        }
    }

    // if adding to the modal, state it in the id
    if (div_id.indexOf("modal") != -1){
        id += "_modal"
    }

    // create the new div
    var new_div = document.createElement("div");
    var options = "";
    for (var i = 0; i < ingredients_list.length; i++) {
        options += ("<option class='ingredient_option' value=" + ingredients_list[i].id + ">" + toTitleCase(ingredients_list[i].name) + "</option>");
    }
    new_div.innerHTML = (`
    <div class="row">
        <div style="width: 40%">
            <select type="text" id="ingredient_` + id + `" name="ingredient_` + id + `" class="form-control selectpicker selectpicker-ingredient_` + id + `" data-live-search="true" onchange="ingredientSelectUpdate(this, ` + JSON.stringify(ingredients_list).replaceAll("\"", "\'") + `)" title="Sélectionner un ingrédient" required>
                <option value="add"
                    data-content='<span class="btn btn-link btn-add-ingredient" data-toggle="modal" data-target="modalForIngredient">
                        <i class="fas fa-plus add_icon"></i> Ajouter un nouvel élément</span>'>
                </option>`
                + options +
            `</select>
        </div>
        <div style="width: 20%">
            <input type="number" id="quantity_` + id + `" name="quantity_` + id + `" min="0.1" step="0.1" class="form-control" placeholder="Quantité" required></input>
        </div>
        <div class="unit" style="width: 20%">
            <label type="text" id="unit_` + id + `" name="unit_` + id + `">-</input>
        </div>
        <button class="close" type="button" onclick="deleteRow(this)">
            <span>&times;</span>
        </button>
    </div>
    `);

    // append it to the div
    div_to_append.appendChild(new_div);

    // refresh to display the new selector
    $("#ingredient_" + id).selectpicker('refresh');
    }

// when user modifies select value, either open the module for adding ingredient, either update ingredient unit
function ingredientSelectUpdate(selector, ingredients_list) {
    // if the value of the ingredient selector is "add", open the modal
    if (selector.value == "add") {
        // update modal button's id to keep track of the row from which the ingredient is being added
        $(".btn-add-ingredient-to-database")[0].id = "line_" + selector.id;
        // simluate click on the modal activator button
        $("#button-for-modal-register-ingredient")[0].click();
    }
    // else update the unit
    else {
        for (i=0; i<ingredients_list.length; i++) {
            if (ingredients_list[i].id == selector.value) {
                selector.parentElement.parentElement.parentElement.parentElement.getElementsByClassName("unit")[0].getElementsByTagName("label")[0].innerHTML = ingredients_list[i].unit;
            }
        }
    }
}

// add ingredient in the database
function addIngredientToDatabase(popup, ingredients_list) {
    // retrieve ingredient's properties
    var name = popup.querySelector("#ingredient").value;
    var unit = popup.querySelector("#unit").value;
    var line = popup.querySelector(".btn-add-ingredient-to-database").id.split("line_")[1];
    // if all required conditions are met, register ingredient
    if (name != '' & unit != '') {
        fetch("register-ingredient", {
            method: "POST",
            body: JSON.stringify({
                name: name,
                unit: unit,
                line: line})
            }    
        ).then(response => response.json())
        .then(response => {
            if (response.status == "fail") {
                $(".alert-modal-exists").show();
            }
            else {
                // close the modal
                $(".close-modal-ingredient").click();
                // add new option to all selectors
                selectors = $(".selectpicker")
                for (var i = 0; i < selectors.length; i++) {
                    option = document.createElement("option");
                    option.value = response.id;
                    option.text = toTitleCase(response.name);
                    selectors[i].append(option);
                }
                // refresh all selectors
                for (var i = 0; i < selectors.length; i++) {
                    $("#ingredient_" + (i+1).toString()).selectpicker('refresh');
                    $("#ingredient_" + (i+1).toString() + "_modal").selectpicker('refresh');
                }
                // update current selector's selection
                console.log($("#" + response.line))
                $("#" + response.line)[0].value = response.id;
                $("#" + response.line).selectpicker('refresh');
                // update current selectors's unit
                $("#" + response.line)[0].parentElement.parentElement.parentElement.parentElement.getElementsByClassName("unit")[0].getElementsByTagName("label")[0].innerHTML = response.unit;
            }
        })
        .catch(error => alert("Erreur : " + error));
    }
    // if not all required conditions for the ingredient are met, show alert message
    else {
        $(".alert-modal-incomplete").show();
    }
}


// add a line for an recipe in the menu form
function addNewRecipeRow(recipes_list, div_id, id) {
    // select the div where to append a new line
    div_to_append = $("#" + div_id)[0];

    // get the id of the new line by adding one to the id of the last line if adding a new line from the button
    if (id === undefined){
        console.log(div_id)
        nb_of_ingredients = div_to_append.getElementsByTagName("select").length;
        // if it is the first ingredient row, id = 1
        if (nb_of_ingredients == 0) {
            id = 1
        }
        // else get the id of the last ingredient and add one (necessary in case some ingredients prior where deleted)
        else {
            id = (parseInt(div_to_append.getElementsByTagName("select")[nb_of_ingredients - 1].id.split("_")[1]) + 1).toString();
        }
    }

    // create the new div
    var new_div = document.createElement("div");
    var options = "";
    for (var i = 0; i < recipes_list.length; i++) {
        options += ("<option class='ingredient_option' value=" + recipes_list[i].id + ">" + toTitleCase(recipes_list[i].name) + "</option>");
    }
    new_div.innerHTML = (`
    <div  class="row ingredient-row-form" align="center">
        <div class="col-md-5">
            <div>
                <select type="text" id="ingredient_` + id + `" name="ingredient_` + id + `" class="form-control selectpicker selectpicker-ingredient_` + id + `" data-live-search="true" onchange="ingredientSelectUpdate(this, ` + JSON.stringify(ingredients_list).replaceAll("\"", "\'") + `)" title="Sélectionner un ingrédient" required>
                    <option value="add"
                        data-content='<span class="btn btn-link btn-add-ingredient" data-toggle="modal" data-target="modalForIngredient">
                            <i class="fas fa-plus add_icon"></i> Ajouter un nouvel élément</span>'>
                    </option>`
                    + options +
                `</select>
            </div>
        </div>
        <div class="col-md-1">
            <button class="close" type="button" onclick="deleteRow(this)">
                <span>&times;</span>
            </button>
        </div>
    </div>`);

    // append it to the div
    div_to_append.appendChild(new_div);

    // refresh to display the new selector
    $("#ingredient_" + id).selectpicker('refresh');
    console.log("Div appened!");
    }

// update stock
function updateStock(line) {
    //transform the quantity div into an input and update the button
    quantity_element = line.parentElement.parentElement.getElementsByClassName("quantity")[0];
    current_quantity = parseFloat(quantity_element.innerHTML);
    console.log(current_quantity)
    quantity_element.innerHTML = (`<input type="text" class="form-control" id="quantity" name="quantity" placeholder="${current_quantity}" required>`);

    line.parentElement.parentElement.getElementsByClassName("stock-btn--update")[0].style.display = "none";
    line.parentElement.parentElement.getElementsByClassName("stock-btn--save")[0].style.display = "flex";
}

// save stock update
function saveStock(line) {
    quantity = line.parentElement.parentElement.getElementsByTagName("input")[0].value;
    ingredient_id = line.parentElement.parentElement.id.split("item_")[1];

    if (quantity && Number.isInteger(quantity*10)) {
        fetch("update-stock", {
            method: "POST",
            body: JSON.stringify({
                id: ingredient_id,
                quantity: quantity
            })
            } 
        ).then((_res) => {
            window.location.href = "stock";
        });
    } else {
        line.parentElement.parentElement.getElementsByClassName("stock-item-line-quantity--alert")[0].style.display = "block"; 
    }
}