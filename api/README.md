# Application API

#### Local API for Purview Catalog Service
- GET [http://localhost:7071/api/purview/typedefs](http://localhost:7071/api/purview/typedefs)
- GET [http://localhost:7071/api/purview/typedefs?guid={guid}](http://localhost:7071/api/purview/typedefs?guid={guid})
- POST [http://localhost:7071/api/purview/typedefs](http://localhost:7071/api/purview/typedefs)
  ```json
  {
    "entityDefs": [],
    "relationshipDefs: [],
  }
  ```
- DELETE http://localhost:7071/api/purview/typedefs?guid={guid}

#### Local API for Storage Containers
- GET [http://localhost:7071/api/storage/containers](http://localhost:7071/api/storage/containers)
- GET [http://localhost:7071/api/storage/containers?name=my-new-container](http://localhost:7071/api/storage/containers?name=my-new-container)
- POST [http://localhost:7071/api/storage/containers](http://localhost:7071/api/storage/containers)
  ```json
  { "name": "my-new-container" }
  ```

#### Local API for Storage Container Blobs
- GET [http://localhost:7071/api/storage/blobs?container=my-new-container](http://localhost:7071/api/storage/blobs?container=my-new-container)
- GET [http://localhost:7071/api/storage/blobs?container=my-new-container&blob=test.json](http://localhost:7071/api/storage/blobs?container=my-new-container&blob=test.json)
- POST [http://localhost:7071/api/storage/blobs](http://localhost:7071/api/storage/blobs)
  ```json
  {
      "container": "my-new-container",
      "blob": "test.json",
      "content": "{\"key\":\"value\"}"
  }
  ```
