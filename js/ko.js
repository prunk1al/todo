var needed=['name', 'projecto', 'relevancia'].reverse()

var Property=function(key, value){
    this.p={ key: key, value: value , editing:ko.observable(0)}
    if ( needed.indexOf(key)==-1){
         this.p.removable=ko.observable(1);
     }
     else{
        this.p.removable=ko.observable(0);
     }

     return this.p
}

var Task=function(data, parent){
    //console.log(data)
    var self=this;
    self.Parent = ko.observable(parent)
    this.properties=ko.observableArray()

    //this.finalizado=ko.observable()



    self.data=data
    if ('_id' in data){
        this.name=ko.observable(data.name);
        this.projecto=ko.observable(data.projecto);
        this.relevancia=ko.observable(data.relevancia);
        this.isNew=ko.observable(false);
    }
    else{
        this.name=ko.observable('');
        this.projecto=ko.observable('')
        this.relevancia=ko.observable('')
        this.properties=ko.observableArray([new Property('name',this.name),new Property('projecto',this.projecto),new Property('relevancia',this.relevancia)]);
        this.finalizado=ko.observable(false);
        this.properties.push(new Property('finalizado',this.finalizado))
        this.isNew=ko.observable(true);
        this.properties().forEach(function(e){
            e.editing(1)
        })
    }

    

    //bindings para nuevos campos
    this.newkey=ko.observable()
    this.newvalue=ko.observable()
    this.newVisible=ko.observable(false)
    
    this.initProperties=function(){
        if ('_id' in data){
            for (var key in self.data) {
                if (data.hasOwnProperty(key) ) {
                    if (key!='_id'){
                        self.properties.push( new Property(key, ko.observable(data[key])));
                    };
                    self[key]=ko.observable(data[key]);
                }
            }
        }
        self.neededFirst()


    };

    this.neededFirst=function(){ //ordenamos los campos obligatorios
        var list=self.properties()
        needed.forEach(function(element){
            indexes = $.map(list, function(obj, index) {
                if(obj.key == element) {
                    return index;
                }
            })
            var e=self.properties.splice(indexes,1)
            self.properties.unshift(e[0])
        })    
    }
    
    this.initProperties();
    
    this.editProperty=function(prop){
        prop.editing(true)
    }
    
    this.saveProperty=function(prop){
        self[prop.key](prop.value());
        prop.editing(false);
        
        if ('_id' in self.data){
            self.updateProperty(prop.key);   
        }
        else{
            self.saveNewTask(prop.key);
        }

    }
    
    this.updateProperty=function(key){
        console.log("sending to mongo");
        var data={'_id':self._id()};
        data[key]=self[key]()
        console.log(data)
        $.post('/update',JSON.stringify(data),function(res){
            console.log('Updated in mongo');
        })
        
        if (key=='relevancia'){
            self.Parent().tableRows.sort(compare)
        }
    }

    this.saveNewTask=function(key){
        data={}
        data.finalizado=false;
        //self.finalizado=ko.observable(false)
        data[key]=self[key]()
        $.post('/update',JSON.stringify(data),function(res){
            console.log('Added in mongo');
            self._id=ko.observable(JSON.parse(res)['_id'])
            self.data['_id']=JSON.parse(res)['_id']
        })
        self.Parent().tableRows.push(self);
        self.Parent().tableRows.sort(compare)
    }
    
    this.newProperty=function(key){
        self.newVisible(true);
    }
    
    this.saveNewProperty=function(){
        console.log("here")
        self[self.newkey()]=ko.observable(self.newvalue());
        self.properties.push( new Property(self.newkey(), ko.observable(self.newvalue())));

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
        delete self[data.key];
        $.post('/drop',JSON.stringify(data),function(res){
            console.log('Dropped in mongo');
        })
    }


    this.ended=function(data){
        self.saveProperty(data)

        return true
    }

    this.saveTask=function(task){
        var data = ko.toJS(task)
        delete data['Parent']
        delete data['isNew']
        //data={}
        //data.finalizado=false;
        //self.finalizado=ko.observable(false)
        //data[key]=self[key]()
        /*$.post('/update',JSON.stringify(data),function(res){
            console.log('Added in mongo');
            self._id=ko.observable(JSON.parse(res)['_id'])
            self.data['_id']=JSON.parse(res)['_id']
        })
        self.Parent().tableRows.push(self);
        self.Parent().tableRows.sort(compare)*/
        console.log(data)
        console.log(self)
    }
}



var Project=function (data) {
    var self=this;
    this.name=ko.observable(data.projecto);
    this.counts=ko.observable(parseInt(data.sum));
}


var ViewModel=function() {
    var self=this;
    this.tableRows=ko.observableArray();
    this.modalTask=ko.observable();
    this.one=ko.observable();

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

    this.newTask=function(){
        var task = new Task({}, self);
        self.loadModal(task)
    }

    this.loadModal=function(task){
        $("#task").empty();
        self.modalTask(task);
        $('#myModal').modal("show");
        $("#myModal").draggable({
            handle: ".modal-header"
        });
    };
   

    this.initData();
}




ko.applyBindings(new ViewModel());

