var Task=function(data, parent){
    //console.log(data)
    var self=this;
    self.Parent = ko.observable(parent)

    self.data=data
    this.name=ko.observable(data.name);
    this.properties=ko.observableArray([]);

    //bindings para nuevos campos
    this.newkey=ko.observable()
    this.newvalue=ko.observable()
    this.newVisible=ko.observable(false)
    
    this.initProperties=function(){
        for (var key in self.data) {
            if (data.hasOwnProperty(key) ) {
                if (key!='_id'){
                    self.properties.push({ key: key, value: ko.observable(data[key]), editing:ko.observable(0) });
                };
                self[key]=ko.observable(data[key]);
            }
        }

    };
    
    this.initProperties();
    
    this.editProperty=function(prop){
        prop.editing(true)
    }
    
    this.saveProperty=function(prop){
        self[prop.key](prop.value())
        self.updateProperty(prop.key)
        prop.editing(false)

    }
    
    this.updateProperty=function(key){
        console.log("sending to mongo");
        console.log(key)
        var data={'_id':self._id()};
        data[key]=self[key]()
        console.log(data)
        $.post('/update',JSON.stringify(data),function(res){
            console.log('Updated in mongo');
        })
        
        if (key=='relevancia'){
            console.log(parent)
            parent.tasks.sort(compare)
            console.log(parent.tasks())
        }
    }
    
    this.newProperty=function(key){
        self.newVisible(true)
    }
    
    this.saveNewProperty=function(){
        self[self.newkey()]=ko.observable(self.newvalue());
        self.properties.push({ key: self.newkey(), value: ko.observable(self.newvalue()) , editing:ko.observable(0) })

        self.updateProperty(self.newkey());

        //reseteamos para poder introducir otros
        self.newkey('');
        self.newvalue('');
        self.newVisible(false);
        
    }
    
    this.dropProperty=function(data){
        $('#'+data.key).remove();
        self[data.key]('');
        data._id=self._id();
        delete self[data.key]
        console.log(data)
        console.log(ko.toJS(self))
        $.post('/drop',JSON.stringify(data),function(res){
            console.log('Updated in mongo');
        })
    }



        
}

var Project=function (data) {
    var self=this;
    this.name=ko.observable(data.projecto)
    this.counts=ko.observable(parseInt(data.sum))
}


var ViewModel=function() {
    var self=this;
    this.tableRows=ko.observableArray();
    this.modalTask=ko.observable();
    this.one=ko.observable()
    
    this.initData=function(){

    	this.initTasks();
    };
    
   this.initTasks=function(){
   
    var url="tasks.json";
    self.tableRows([])
     this.one(true)
        $.get( url, function( data ) {
        var dta=JSON.parse(data);
        var a =[];
        for(var i in dta){
            var t =  new Task(dta[i], self);
            self.tableRows.push(t);
            
        }
        self.tableRows.sort(compare);
      });
    }

    this.initProjects=function(){
    var url="projectos.json"
    self.tableRows([])
    this.one(false);

        $.get( url, function( data ) {
        var dta=JSON.parse(data);
        var a =[];
        for(var i in dta){
            var t =  new Project(dta[i], self);
            console.log(t)
            self.tableRows.push(t);
            
        }
        self.tableRows.sort(compare);
      });
    }


    this.loadModal=function(task){
        $("#task").empty();
        console.log(ko.toJS(task))
        self.modalTask(task);
        $('#myModal').modal("show");
    };
    this.saveTask=function(task){
        $("#task").empty();
        $('#myModal').modal("show")
        var properties = [];
        for (var key in task) {
            if (task.hasOwnProperty(key)) {
                properties.push({ key: key, value: task[key] });
            }
        }
        self.task(properties);
    };

    this.initData()
}


ko.bindingHandlers.sortable = {
    init: function (element, valueAccessor) {
        // cached vars for sorting events
        var startIndex = -1,
            koArray = valueAccessor();
        
        var sortableSetup = {
            // cache the item index when the dragging starts
            start: function (event, ui) {
                startIndex = ui.item.index();
                
                // set the height of the placeholder when sorting
                ui.placeholder.height(ui.item.height());
            },
            // capture the item index at end of the dragging
            // then move the item
            stop: function (event, ui) {
                
                // get the new location item index
                var newIndex = ui.item.index();
                
                if (startIndex > -1) {
                    //  get the item to be moved
                    var item = koArray()[startIndex];
                     
                    //  remove the item
                    koArray.remove(item);
                    
                    //  insert the item back in to the list
                    koArray.splice(newIndex, 0, item);

                    //  ko rebinds the array so remove duplicate ui item
                    ui.item.remove();
                }

            },
            placeholder: 'fruitMoving'
        };
        
        // bind
        $(element).sortable( sortableSetup );  
    }
};


ko.applyBindings(new ViewModel());

