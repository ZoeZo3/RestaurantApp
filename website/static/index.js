// when user modifies select value, either open the module for adding ingredient, either update ingredient unit
function ingredientSelectUpdate(selector, ingredients_list) {
    // if the value of the ingredient selector is "add", open the modal
    if (selector.value == "add") {
        // update modal button's id to keep track of the row from which the ingredient is being added
        $(".btn-add-ingredient-to-database")[0].id = "line_" + selector.id;
        // simluate click on the modal activator button
        $("#buttonForModalRegisterIngredient")[0].click();
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
function addIngredientToDatabase(list) {
    var popup = document.getElementById("modalRegisterIngredient")
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
                $("#" + response.line)[0].value = response.id;
                $("#" + response.line).selectpicker('refresh');
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

// update stock
function updateStock(line) {
    //transform the quantity div into an input and update the button
    quantity_element = line.parentElement.parentElement.getElementsByClassName("quantity")[0];
    current_quantity = parseFloat(quantity_element.innerHTML);
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