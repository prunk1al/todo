
var Day=function(data){

	this.fecha=ko.observable(data);
	this.roles=ko.observableArray([]);

};

var Rol=function(data) {
    this.name=ko.observable(data.name)
    this.con=ko.observable(data.con)
    this.sin=ko.observable(data.sin)
}

var List =function() {
    var self=this;
    this.tipo=ko.observable("")
    this.currentDay=ko.observable(new Day(""));
    this.dayList=ko.observableArray([]);
    this.currentFecha=ko.computed(function(){return this.currentDay().fecha()},this)
    this.h1=ko.observable("")
    this.h2=ko.observable("")

     this.changeDay=function(dayClicked){
        console.log(dayClicked)
        self.currentDay(dayClicked)
    }
}


var ViewModel=function() {
    var self=this;
    this.tasks=ko.observableArray();
    this.task=ko.observableArray();


    this.initData=function(){

    	var url="tasks.json"
    	$.get( url, function( data ) {
        self.tasks(JSON.parse(data))
        console.log(self.tasks())
      })
      console.log(self.tasks())
    }
    
    this.loadModal=function(task){
        console.log(task)
        $("#task").empty();
        var properties = [];
        for (var key in task) {
            if (task.hasOwnProperty(key)) {
                properties.push({ key: key, value: task[key] });
            }
        }
        console.log(properties)
        self.task(properties)
        console.log(self.task())
        $('#myModal').modal()
    }

    this.initData()
}




ko.applyBindings(new ViewModel());

