//Budget Controller
var budgetController = (function(){
class Income {
    constructor(id,desc,value){
        this.id = id;
        this.desc = desc;
        this.value = value;
    }
}
class Expense{
    constructor(id,desc,value){
        this.id = id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    }
    calPer = function(total){
        if (total > 0){
            this.percentage = Math.round((this.value/total) * 100)   
       }else{
           this.percentage = -1;
       }
    }
    getPercentage = function(){
        return this.percentage;
    }
}
    
function calTotal(type){
    let sum = 0;
    data.allItems[type].forEach(cur=>{
        sum += cur.value
    });
    data.totals[type] = sum;
};   
const data = {
    allItems : {
    exp : [],
    inc : []
},
    totals: {
        exp : 0,
        inc : 0
    },
    budget : 0,
    percentage : -1
};

return {
    addItems : function(type,desc,value){
        var newItem,ID;
        if(data.allItems[type].length > 0){
            let idArr = data.allItems[type].map(el=>el.id)
            idArr.sort() 
            ID =  idArr[idArr.length-1] + 1
        }else{
            ID = 0;
        }
        if(type == "inc"){
            newItem = new Income(ID,desc,value);
            
        }else{
            newItem = new Expense(ID,desc,value)
        }
        data.allItems[type].push(newItem)
        this.persistData()
        return newItem;
    },
    calculateTotal : function(){
      //Calculate the total expense and income
        calTotal("exp");
        calTotal("inc")
        //Calculate the budget
        data.budget = data.totals.inc - data.totals.exp;
        //Calculate the percentage
        if(data.totals.inc > 0){
         data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);   
        }else{
            data.percentage = -1;
        }
    },
     getBudget : function(){
        return {
            budget : data.budget,
            totalInc : data.totals.inc,
            totalExp : data.totals.exp,
            percentage : data.percentage
        }},
    deleteItem : function(type,id){
        var ids,index;
        ids = data.allItems[type].map(function(current){
            return current.id }
                                     );
        index = ids.indexOf(id);
        if (index !== -1){
            data.allItems[type].splice(index,1)
        }
        this.persistData()
    },
    calPercentage: function(){
        data.allItems.exp.forEach(el=>{
            el.calPer(data.totals.inc)
        })
    },
    getPercentage:function(){
        var percentages = data.allItems.exp.map(function(current){
            return current.getPercentage()
        })
        return percentages
    },
    persistData : function(){
        const localdata = {
            inc : data.allItems.inc,
            exp : data.allItems.exp
        }
        localStorage.setItem('data',JSON.stringify(localdata))
    },
    getData: function(){
        const localdata = JSON.parse(localStorage.getItem('data'))
        if(localdata) var {inc,exp} = localdata
        inc.forEach(el=>this.addItems('inc',el.desc,el.value))
        exp.forEach(el=>this.addItems('exp',el.desc,el.value))

    },
    getListItem : function(){
        return [data.allItems.exp,data.allItems.inc]
    },
    sortListItem : function(type,category){
        let prices = data.allItems[type].map(el=>el[category])
        prices.sort(function(a, b){return a-b})
        const oldArr = data.allItems[type]
        data.allItems[type] = []
        for(let i = 0; i < prices.length ; i++){
            let count = 0;
            oldArr.forEach(el => {if(el[category] == prices[i] && count == 0){ data.allItems[type].push(el)
                count = 1;
            }})
        }
        
    }
}
})();



//UI Controller
var UIController = (function(){
    const DOMStrings = {
        inputType : ".add__type",
        inputDesc : ".add__description",
        inputValue : ".add__value",
        addButton : ".add__btn",
        expenseCON : ".expenses__list",
        incomeCON : ".income__list",
        budget: ".budget__value",
        totalInc : ".budget__income--value",
        totalExp : ".budget__expenses--value",
        percentage : ".budget__expenses--percentage",
        container : ".container",
        itemPercentage : ".item__percentage",
        date : ".budget__title--month",
        incSort: ".inc_sort",
        expSort : '.exp_sort',
        expList : ".expenses__list",
        incList : ".income__list",
        expSortBtn : ".exp_sort",
        incSortBtn : '.inc_sort'
    };
     const formatNumber = function(num,type){
          var int,dec,sign;
          num = Math.abs(num);
          num = num.toFixed(2);
          num = num.split(".")
          int = num[0];
          dec = num[1];
          if (int.length > 3){
              int = int.substr(0,int.length - 3) + "," + int.substr(int.length - 3,3)
          }
          return  (type == 'exp' ? '-' : '+') + ' ' + int + "." + dec ;
      };
  return {
      getInput: function(){
          return {
            type : document.querySelector(DOMStrings.inputType).value,
            desc : document.querySelector(DOMStrings.inputDesc).value,
            value : parseFloat(document.querySelector(DOMStrings.inputValue).value),
          }
      },
      addListItem : function(object,type){
          let html,newHTML,element;
          //Create HTML tag with placeholder text
          if(type == "inc"){
            element = DOMStrings.incomeCON;
           html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'   
          }else{
              element = DOMStrings.expenseCON;
           html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'   
          }
          //Insert actual data
          newHTML = html.replace("%id%",object.id);
          newHTML = newHTML.replace("%description%", object.desc)
          newHTML = newHTML.replace("%value%",formatNumber(object.value,type))
          //Insert HTML into DOM
          document.querySelector(element).insertAdjacentHTML('beforeend',newHTML)
      },
      deleteListItem: function(selectorid){
          const element = document.getElementById(selectorid);
          element.parentNode.removeChild(element)
      },
      clearFields : function(){
        let fields,fieldsArr;
        fields = document.querySelectorAll(DOMStrings.inputDesc + "," + DOMStrings.inputValue);
        fieldsArr = Array.prototype.slice.call(fields);
        fieldsArr.forEach(function(current){
            current.value = "";
        })
        fieldsArr[0].focus()
      },
      displayBudget: function(obj){
          document.querySelector(DOMStrings.budget).textContent = formatNumber(obj.budget, (obj.budget > 0 ? "inc" : "exp"));
          document.querySelector(DOMStrings.totalInc).textContent = formatNumber(obj.totalInc,"inc");
          document.querySelector(DOMStrings.totalExp).textContent = formatNumber(obj.totalExp,"exp");
          if (obj.percentage > 0){
           document.querySelector(DOMStrings.percentage).textContent = obj.percentage + "%";   
          }else{
               document.querySelector(DOMStrings.percentage).textContent = "--";
          }
      },
      displayPercentages : function(percentage){
       let fields,fieldsArr;
          fields = document.querySelectorAll(DOMStrings.itemPercentage)
          fieldsArr = Array.from(fields);
          fieldsArr.forEach((current,index)=>{
            if(index >= 0){
                if (percentage[index] == -1){
                  current.textContent = "--%";   
                }else{
                     current.textContent = percentage[index] + "%";
                }
            }else{
               current.textContent = "---" 
            } 
        })
      },
      displayDate : function(){
          let date,months,month;
          const now = new Date()
          month = now.getMonth()
          months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
          date = months[month] + " " + now.getFullYear()
          document.querySelector(DOMStrings.date).textContent = date
      },
      changeType : function(){
          let fields,fieldsArr;
          fields = document.querySelectorAll(DOMStrings.inputType + "," + DOMStrings.inputDesc + "," + DOMStrings.inputValue);
          fieldsArr = Array.from(fields)
          fieldsArr.forEach((current)=>{
              current.classList.toggle("red-focus")
          })
          document.querySelector(DOMStrings.addButton).classList.toggle("red")
      },
      displaySortedList : function(list,type){
        let nodes;  
        if (type == 'inc'){
            nodes =  document.querySelectorAll('[id^="inc-"]') 
          }else{
            nodes =  document.querySelectorAll('[id^="exp-"]')
          }
          const string = `${type}List`
        nodes.forEach(el=>document.querySelector(DOMStrings[string]).removeChild(el))
        list.forEach(el=>this.addListItem(el,type))
        let btnString = document.querySelector(DOMStrings[`${type}SortBtn`])
        btnString.textContent == "By Default" ? document.querySelector(DOMStrings[`${type}SortBtn`]).textContent = "Sort By Value" : document.querySelector(DOMStrings[`${type}SortBtn`]).textContent = "By Default"
        btnString.classList.toggle("sortByValue")
      },
      getDOMStrings : function(){
          return DOMStrings
      }
  }
})();


//Global App Controller
var controller = (function(budgetCtrl,UICtrl){
    const DOM = UICtrl.getDOMStrings();
    
    const setupEventListener = function(){
        //Add Button
    document.querySelector(DOM.addButton).addEventListener("click",addItem)
    //Enter Button
    document.addEventListener("keydown",function(event){
        if(event.keyCode == "13" || event.which == "13"){
           addItem();
        }
    })
    document.querySelector(DOM.container).addEventListener("click",delItem)
    
    document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changeType)

    window.addEventListener("load",loadLocalBudget)
    //Bind sort function with different type
    const sortInc = sortValue.bind(this,"inc")
    const sortExp = sortValue.bind(this,"exp")

    document.querySelector(DOM.incSort).addEventListener("click",sortInc)

    document.querySelector(DOM.expSort).addEventListener("click",sortExp)
    };
    
    function updateBudget(){
        let budget;
         //Calculate the budget
        budgetCtrl.calculateTotal();
        budget = budgetCtrl.getBudget();
        //Update the UI
        UICtrl.displayBudget(budget)
    };
    //Add Item Function
    function addItem(){
        let input,newItem;
        //Get input data
        input = UICtrl.getInput()
        if (input.desc != "" && !isNaN(input.value) && input.value > 0){
         //Add value to budget controller
        newItem = budgetCtrl.addItems(input.type,input.desc,input.value)
        //Add item to UI
        UICtrl.addListItem(newItem,input.type)
        UICtrl.clearFields()
        //Calculate and update budget
        updateBudget()   
        //Update percentage
        updPercentage()
        //Update sort 
        document.querySelector(DOM[`${input.type}SortBtn`]).textContent = "Sort By Value";
        document.querySelector(DOM[`${input.type}SortBtn`]).classList.toggle("sortByValue")
        }
    };
    function updPercentage(){
        let percentages;
        //Calculate the percentage
        budgetCtrl.calPercentage()
        percentages = budgetCtrl.getPercentage()
        //Update UI
        UICtrl.displayPercentages(percentages);
    };
    function delItem(event){
        let itemID,splitID,type;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            id = parseInt(splitID[1])
            //Delele item from data structure
            budgetCtrl.deleteItem(type,id)
            //Delete from user interface
            UICtrl.deleteListItem(itemID);
            //Update Budget
            updateBudget();
            //Update Percentage
            updPercentage();
        }
    };
    function loadLocalBudget(){
        budgetCtrl.getData()
        const [exp,inc] = budgetCtrl.getListItem()
        if(exp)exp.forEach(el=>UICtrl.addListItem(el,'exp'))
        if(inc)inc.forEach(el=>UICtrl.addListItem(el,'inc'))
        if(inc || exp){updateBudget()}
        if(exp){updPercentage()}
    };
    function sortValue(type){
        const state = document.querySelector(DOM[`${type}SortBtn`]).textContent
        if (state == "Sort By Value"){
            budgetCtrl.sortListItem(type,"value")    
        }else{
            budgetCtrl.sortListItem(type,"id")
        }
        const [exp,inc] = budgetCtrl.getListItem()
        type == 'inc' ?  UICtrl.displaySortedList(inc,type) : UICtrl.displaySortedList(exp,type)
        updateBudget()
        updPercentage()
    }
    return {
        init : function(){
            console.log("Application has been started");
            setupEventListener()
            UICtrl.displayDate()
        }
    }
    
})(budgetController,UIController);
controller.init()