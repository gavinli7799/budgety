//Architecture of the application

// x and add() is private. Because of closures, publicTest could always access the outter elememts.

//BUDGET controller
var budgetController = (function () {

    // Expense Constructor
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0)
            this.percentage = Math.round(this.value / totalIncome * 100);
        else
            this.percentage = -1;
    };

    /*    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };*/

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var data = {
        allItems:{
            exp : [],
            inc : []
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, desc, val){
            var newItem, ID;
            // ID = last_ID + 1
            // Create new ID
            if (data.allItems[type].length === 0)
                ID = 0;
            else
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            // Create new item based on type
            if (type === 'exp'){
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, desc, val);
            }

            // Push it into data structure
            data.allItems[type].push(newItem);
            return newItem; 
        },

        deleteItem: function(type, id){

            var ids, index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            //splice using to delete
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function(){

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // caculcate the percentage of income that we spent
            if (data.totals.inc > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;

        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.percentage;
            });

            return allPercentages;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    };
})();   


//UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){

        var numSplit;
        // + or - before number, 2 decimals, comma sparating thousands
        num = Math.abs(num);
        num = num.toFixed(2); //convert to string at same time

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? '- '  : '+ ') + int + '.' + dec;

    };


    var displayDate = function() {

        var now, months, month, year;

        now = new Date();
        //var newYear = new Date(2019, 00, 01);
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', ' August', 'Septemper', 'October', 'November', 'December'];
        day = now.getDate();
        month = now.getMonth();
        year = now.getFullYear();

        document.querySelector(DOMstrings.dateLabel).textContent = day + ' ' + months[month] + ' ' + year;

    };
    
    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value, // will be inc or exp
                description : document.querySelector(DOMstrings.inputDescription).value,

                //convert string into float
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if (type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button</div></div></div>';
            }
            else if (type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type));
            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml); 
        },


        deleteListItem: function(selectorID){

            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);

        },

        //clear input fields after enter
        clearFields: function(){
            var fields, fieldsArr;

            //Create a NodeList of input
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            //convert NodeList fieldArr into array
            // Array.slice(a,b)  get [a,b) of the array
            fieldsArr = Array.prototype.slice.call(fields);

            // foreach with callback function
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            //focus cursor to the first field
            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

            if (obj.percentage > 0)
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            else 
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPerLabel);

            nodeListForEach(fields, function(current, index){
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });

        },

        changeType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType +','+
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });            

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        initUI: function(){
            //init budget
            this.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp: 0,
                percentage: -1
            });

            displayDate();
            
            //focus cursor to the first field
            document.querySelector(DOMstrings.inputDescription).focus();

        },

        getDOMstrings : function(){
            return DOMstrings;
        }
    };

})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function(){
        var DOM = UIController.getDOMstrings();

        //click to insert item
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        //enter key to insert item
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){

        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input, newItem;

        // 1. Get the filled input data
        input = UICtrl.getInput();

        //NaN -- not a number
        if (input.description !== "" && !isNaN (input.value) && input.value > 0)
        {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. ADd the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };


    var ctrlDeleteItem = function(event){
        var itemID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-0, inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. delele item from UI
            UICtrl.deleteListItem(itemID);

            //3. update and show the new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }

    };

    return {
        init: function(){
            setupEventListeners();
            UICtrl.initUI();
        }
    }

})(budgetController, UIController);


controller.init();











