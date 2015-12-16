var Task=function(data){
    console.log(data)
    var self=this;
    self.data=data
    this.name=ko.observable(data.name);
    this.properties=ko.observableArray([]);

    
    
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
    /*
    this.loadModal=function(task){
        $("#task").empty();
        
        var prop=self.properties();
        for (var p in prop){
        console.log(prop[p]);
        var key=prop[p].key
        var value=prop[p].value
        $('#task').append('<tr><td><label >'+key+'</label></td><td><label>'+value+'</label></td><td>');
        $('#task').append(' <button type="button" class="btn btn-default" data-bind="click:editProperty, visible:!editing()">');
        $('#task').append('<span class="glyphicon glyphicon-pencil" aria-hidden="false"></span> </button>');
                                        
        $('#task').append('<button type="button" class="btn btn-default" data-bind="click:saveProperty, visible:editing">');
        $('#task').append('<span class="glyphicon glyphicon-save" aria-hidden="false"></span></td></tr>');
        }
        $('#myModal').modal("show");        
        
    };
    */
    this.initProperties();
    
    this.editProperty=function(prop){
        //$('#'+prop.key+'input').replaceWith('<input type="text" data-bind="value: value" id='+prop.key+'input >')
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
        
    }
    
    this.newProperty=function(key){
        $("#task").append("<tr id='newProp'><td><input id='newKey' data-bind='value: newkey' type='text'></td><td><input id='newValue' data-bind='value: newvalue' type='text'></td> <td><button type='button' id='newButton' class='btn btn-default' data-bind='click:saveNewProperty'><span class='glyphicon glyphicon-save' aria-hidden='false'></span></button></td></tr>");
        self.newkey=ko.observable()
        self.newvalue=ko.observable()
        ko.applyBindings(self,$("#newKey")[0])
        ko.applyBindings(self,$("#newValue")[0])
        ko.applyBindings(self,$("#newButton")[0])
    }
    
    this.saveNewProperty=function(){
        self[self.newkey()](self.newvalue());
        self.updateProperty(self.newkey());
        
    }
    
    this.dropProperty=function(data){
        $('#'+data.key).remove();
        self[data.key]('');
        data._id=self._id();
        delete self[data.key]
        console.log(data)
        $.post('/drop',JSON.stringify(data),function(res){
            console.log('Updated in mongo');
        })
    }
        
}

var ViewModel=function() {
    var self=this;
    this.tasks=ko.observableArray();
    this.modalTask=ko.observable();
    
    this.initData=function(){

    	var url="tasks.json";
    	$.get( url, function( data ) {
    	var dta=JSON.parse(data);
    	var a =[];
    	for(var i in dta){
            var t =  new Task(dta[i]);
            self.tasks.push(t);
        }
        //self.tasks(a);
        console.log(self.tasks());
      });
    };
    
    this.loadModal=function(task){
        $("#task").empty();
        console.log(task)
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

