import tornado.ioloop
import tornado.web
from pymongo import MongoClient
from bson.objectid import ObjectId
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
        filter={'_id':ObjectId(data['_id'])}
        del data['_id']
        task=collection.update_one(filter,{'$set':data} )
        print task


def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/tasks.json", tasksJson),
        (r"/update", Update),
         (r'/js/(.*)', tornado.web.StaticFileHandler, {'path': './js'})
    ], debug=True)

if __name__ == "__main__":
    app = make_app()
    app.listen(8889)
    tornado.ioloop.IOLoop.current().start()
