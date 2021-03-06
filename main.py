import tornado.ioloop
import tornado.web
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.code import Code
import json

client= MongoClient('localhost', 27017)
db=client['todo']
collection=db['tasks']

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('index.html')

class tasksJson(tornado.web.RequestHandler):
    def get(self):
        data=[]
        datas=collection.find()
        for d in datas:
            d['_id']=str(d['_id'])
            data.append(d)
        self.write(json.dumps(data))

class Update(tornado.web.RequestHandler):
    def post(self):
        data=json.loads(self.request.body)
        if '_id' in data:
            filter={'_id':ObjectId(data['_id'])}
            del data['_id']
            print data
            task=collection.update_one(filter,{'$set':data} )
            print task
        else:
            print data
            task=collection.insert_one(data).inserted_id
            self.write(json.dumps({'_id':str(task)}))


class Drop(tornado.web.RequestHandler):
    def post(self):
        data=json.loads(self.request.body)
        filter={'_id':ObjectId(data['_id'])}
        del data['_id']
        print data
        task=collection.update_one(filter,{'$unset':{data['key']:''}} )
        task=collection.find(filter)
        for t in task:
            print t

class projectosJson(tornado.web.RequestHandler):
    def get(self):
        reducer=Code('function(doc, prev) { prev.sum += 1}')
        data=collection.group(key = {'projecto': True}, condition={}, initial= {'sum': 0}, reduce= reducer)
        self.write(json.dumps(data))


def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/tasks.json", tasksJson),
        (r"/update", Update),
        (r"/drop", Drop),
        (r"/projectos.json", projectosJson),
         (r'/js/(.*)', tornado.web.StaticFileHandler, {'path': './js'})
    ], debug=True)

if __name__ == "__main__":
    app = make_app()
    app.listen(8889)
    tornado.ioloop.IOLoop.current().start()
