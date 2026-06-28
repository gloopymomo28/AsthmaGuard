from pymongo import MongoClient
import pymongo
client = MongoClient("mongodb://localhost:27017")
db = client["asthmadata"]
print(type(db))
print(db["magic_links"])
