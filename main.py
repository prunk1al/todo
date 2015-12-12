import tornado.ioloop
import tornado.web
from pymongo import MongoClient
import json


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')

class ocupacion(tornado.web.RequestHandler):
    def get(self):
        self.render('ocupacion.1.html')


class tasksJson(tornado.web.RequestHandler):
    def get(self):
        data=[]
        client= MongoClient('localhost', 27017)
        db=client['todo']
        collection=db['tasks']
        """task = {"name": "prueba",
                "descripcion": "description",
                "projecto": "prueba",
                "relevancia": 1}
        collection.insert_one(task)"""
        datas=collection.find()
        for d in datas:
            d.pop('_id')
            data.append(d)
        self.write(json.dumps(data))

class altas(tornado.web.RequestHandler):
    def get(self):
        self.render('altas.html')


class altasJson(tornado.web.RequestHandler):
    def get(self):
        data=[]
        client= MongoClient('192.168.0.155', 27017)
        db=client['statistics']
        altas=db['altas']
        datas=altas.find({'$and':[
                                {'Fecha_Alta':{'$gte':'2015-08-17'}},
                                {'Fecha_Alta':{'$lte':'2015-08-19'}}
                                ]
                          })
        for d in datas:
            d.pop('_id')
            data.append(d)


        self.write(json.dumps(data))

def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/altas.html", altas),
        (r"/altas.json", altasJson),
        (r"/ocupacion.1.html", ocupacion),
        (r"/tasks.json", tasksJson),
         (r'/js/(.*)', tornado.web.StaticFileHandler, {'path': './js'})
    ], debug=True)

if __name__ == "__main__":
    app = make_app()
    app.listen(8889)
    tornado.ioloop.IOLoop.current().start()
