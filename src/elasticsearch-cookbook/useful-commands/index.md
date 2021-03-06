---
layout: full.html
algolia: true
title: Useful commands
description: learn time-saving elasticsearch commands
order: 300
---

# Useful commands

First of all, let's take a look at some commands to explore your Elasticsearch instance.

---

## List indices

List all available indices on your Elasticsearch instance:

```bash
#!/bin/bash

curl -g "http://localhost:9200/_cat/indices?pretty"
```


Reply:

```bash
#!/bin/bash

# yellow open example 1 1 5 0 10.4kb 10.4kb
```

---


## Get an index mapping

The mapping of an index consists of the list of the mappings of all the collections contained in the given index.
To retrieve an index mapping, you can use the following command:

```bash
#!/bin/bash

curl -g -X GET "http://localhost:9200/example/?pretty"
```

Reply:

```json
{
  "example" : {
    "aliases" : { },
    "mappings" : {
      "blogpost" : {
        "properties" : {
          "author" : {
            "type" : "string",
            "analyzer" : "standard"
          },
          "body" : {
            "type" : "string",
            "analyzer" : "english"
          },
          "publish_date" : {
            "type" : "date",
            "format" : "yyyy-MM-dd||epoch_millis"
          },
          "status" : {
            "type" : "string",
            "index" : "not_analyzed"
          },
          "tags" : {
            "type" : "string",
            "index" : "not_analyzed"
          },
          "title" : {
            "type" : "string",
            "analyzer" : "english"
          }
        }
      }
    },
    "settings" : {
      "index" : {
        "creation_date" : "1474364614778",
        "number_of_shards" : "1",
        "number_of_replicas" : "1",
        "uuid" : "UXxlOo1uSy-vIlvo_8o5vA",
        "version" : {
          "created" : "2040099"
        }
      }
    },
    "warmers" : { }
  }
}
```
