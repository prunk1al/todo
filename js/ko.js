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




ko.applyBindings(new ViewModel());

