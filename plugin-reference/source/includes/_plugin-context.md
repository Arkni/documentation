# The plugin context

The plugin context is an object containing a set of constructors, accessors and configurations, allowing plugins to interact with Kuzzle.

A plugin context is provided by Kuzzle to plugins when calling their `init` function.  
Each plugin receives its own plugin context instance.

Here is the list of shared objects contained in the provided ``context``:

| Attribute path | Purpose                      |
|----------------|------------------------------|
| `context.accessors.execute` | Access to Kuzzle API |
| `context.accessors.passport` | Access to Kuzzle [Passport](http://passportjs.org) instance. Allow [authentication plugins](/#gt-authentication-plugin) to register a new login strategy to Kuzzle. |
| `context.accessors.router` | Access to Kuzzle protocol communication system. Allow **protocol** plugins to interface themselves with Kuzzle. |
| `context.accessors.users` | Access to users management, especially useful for authentication plugins. Provides methods for handling users. This accessor is mainly used by authentication plugins. |
| `context.accessors.validation` | Access to validation mechanisms, useful to validate documents and add field types. |
| `context.config` | Contains the entire Kuzzle instance configuration (most of it coming from Kuzzle configuration file) |
| `context.constructors.Dsl` | Constructor allowing plugins to instantiate their own Kuzzle real-time engine instance |
| `context.constructors.Request` | Constructor for standardized requests sent to Kuzzle |
| `context.constructors.BaseValidationType` | Constructor for the Validation Type base constructor |
| `errors.<ErrorConstructor>` |Kuzzle error constructors, built dynamically from available Kuzzle error objects at runtime|

**Note:** `context.accessors` are not available to [worker plugins](#gt-worker-plugins), as they are run in their own process(es), without access to Kuzzle instances.

## Accessor

<aside class="notice">
<a href="#executing-listeners-in-separate-threads">Plugins executed on separate threads</a> don't have access to accessors.
</aside>

### `execute`

Sends a request to [Kuzzle API](/api-reference).

#### Arguments

| Name | Type | Description                      |
|------|------|----------------------------------|
| `request` | `Request` | A [`Request`](#request) to execute  |
| `callback(error, request)` | `Function` | Function executed with the request's result |

**Note:** when `callback` is invoked, the `request` argument is ALWAYS filled, even when there is an error. This argument is the provided request, with its `result` and/or `error` parts filled. To obtain the standardized Kuzzle response from it, simply use the getter `request.response`.

Example:

```js
let
  derivedRequest = new context.constructors.Request(request, {
    index: 'index',
    collection: 'collection',
    controller: 'read',
    action: 'get',
    _id: 'documentID'
  });

context.accessors.execute(request, (error, request) => {
  /*
   Kuzzle's response can be obtained with request.response

   See Request constructor documentation for more information
   */
});
```

### `passport.use`

Implements [Passport `use()` method](http://passportjs.org/docs/configure)

#### Arguments

| Name | Type | Description                      |
|------|------|----------------------------------|
| `strategy` | `Strategy object` | A Passport instantiated strategy object |

<aside class="notice">Passport strategy constructors take a "verify" callback. As the following example demonstrates, if the provided callback uses "this.[attribute]" attributes, then it's necessary to bind the provided callback to the plugin's context</aside>

Example:

```js
var LocalStrategy = require('passport-local').Strategy;

function verify (username, password, done) {
  // verification code
  if (userVerified) {
    done(null, userInformation);
  }
  else {
    done(error);
  }
}

pluginContext.accessors.passport.use(new LocalStrategy(verify.bind(this)));
```

### `router.newConnection`

Declares a new connection for a given protocol.  

#### Arguments

| Name | Type | Description                      |
|------|------|----------------------------------|
|`protocolName`|`string`|Protocol name, used for Kuzzle internal statistics |
|`connectionUniqueId`|`string`|Unique ID identifying the user connection|

#### Returns

A `promise` resolving to a `RequestContext` object. This object is needed for other router methods.

### `router.execute`

Forward a request to Kuzzle.

#### Arguments

| Name | Type | Description                      |
|------|------|----------------------------------|
|`request`|`Request`| An user request wrapped as a `Request` instance|
|`callback`|`function`| Callback called with the request corresponding results |

#### Callback

The callback is invoked once the request has been processed by Kuzzle.  
The provided callback is resolved with a `response` argument, which is a plain-object, representing a standardized [Kuzzle response](/api-reference/#kuzzle-response).

### `router.removeConnection`

Removes a connection from the connection pool maintained by Kuzzle.  
Not calling this method after a connection is dropped will result in a memory-leak.

#### Arguments

| Name | Type | Description                      |
|------|------|----------------------------------|
|`context`|`RequestContext`| Object identifying the connection context. Obtained by calling `newConnection()`|


### `users.create`

Creates a new user in Kuzzle. Will return an error if the user already exists.

#### Arguments

| Name | Type | Default Value | Description                      |
|------|------|---------------|----------------------------------|
|`loginName`|`string`| | Name of the user's login to create |
|`userProfile`|`string`|`default`| [User profile](#permissions) |
|`userInfo`|`object`| `{}` | Misc. information about the user |

#### Returns

A `promise` resolving a `user` object containing the created information.

### `users.load`

Loads a user from Kuzzle

#### Arguments

| Name | Type | Description                      |
|------|------|----------------------------------|
|`loginName`|`string`| Name of the user's login to load |

#### Returns

A `promise` resolving to a `user` object containing the user information.


### `validation.validate`

Validates a document wrapped in a `Request` object.

#### Arguments

| Name | Type | Description                      |
|------|------|----------------------------------|
|`request`|`Request`| A document wrapped as a `Request` object |
|`verbose`|`boolean`| Defines the behavior of the validation |

#### Returns

If `verbose` is set to `false`:

Returns a `promise` that resolves to a modified `Request` instance where `defaultValues` are applied. Rejects if validation fails.

If `verbose` is set to `true`:

Returns a `promise` that resolves to an `object`:

```javascript
{
  errorMessages: ...,
  validation: ...
}
```

Where:

* `errorMessages` is a structured javascript object reflecting the structure of the document with all errors collected during the validation process
* `validation` is a `boolean` reflecting the validation state.

### `validation.addType`

#### Arguments

| Name | Type | Description                      |
|------|------|----------------------------------|
|`validationType`|`object`| An object instance of a validation type |

#### Returns

Nothing. Can throw a `PluginImplementationError` if the validation type has not the expected form.

#### validationType form

```javascript
/**
 * @typedef {{
 *   validate: Function,
 *   validateFieldSpecification: Function,
 *   typeName: string,
 *   allowChildren: boolean,
 *   checkAllowedProperties: Function,
 *   allowedTypeOptions: string[]
 * }} ValidationType
 */
```

See constructor `BaseValidationType` for more details.

## Constructor

### `BaseValidationType`

The `BaseValidationType` constructor provides a base to create your own validation types. It provides a common structure for all validation types developped in Kuzzle.

You can find an example of a type creation in the [Kuzzle source code](https://github.com/kuzzleio/kuzzle/blob/master/lib/api/core/validation/types/type.js.template).

### `Dsl`

The DSL constructor provided in the plugin context gives access to [Kuzzle real-time filtering capabilities](#filtering-syntax). It allows managing filters, and testing data to get a list of matching filters.

Each plugin can instantiate its own sandboxed DSL instance:

```js
var dsl = new context.constructors.Dsl();
```

The DSL exposes the following methods:

#### `exists`

Returns a boolean indicating if filters exist for an index-collection pair

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
|`index`|`string`| Data index name |
|`collection`|`string`| Data collection name |


**Returns**

Returns `true` if at least one filter exists on the provided index-collection pair, returns `false` otherwise

#### `getFilterIds`

Retrieves filter IDs registered on an index-collection pair


**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
|`index`|`string`| Data index name |
|`collection`|`string`| Data collection name |

**Returns**

An `array` of `filterId` corresponding to filters registered on an index-collection pair.

#### `register`

Registers a filter to the DSL.

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
|`index`|`string`| Data index name |
|`collection`|`string`| Data collection name |
|`filters`|`object`| Filters in [Kuzzle DSL](#filtering-syntax) format |

**Returns**

A `promise` resolving to an object containing the following attributes:

* `id`: the filter unique identifier
* `diff`: `false` if the filter already existed in the engine. Otherwise, contains an object with the canonical version of the provided filters

#### `remove`

Removes all references to a given filter from the DSL

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
|`filterId`|`string`| Filter unique ID. Obtained by using `register`|

**Returns**

A `promise` resolved once the filter has been completely removed from the DSL

#### `test`

Test data against filters registered in the DSL, returning matching filter IDs, if any.

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
|`index`|`string`| Data index name |
|`collection`|`string`| Data collection name |
|`data`|`object`| Data to test against filters |
|`documentId`|`string`| If applicable, document unique ID |


**Returns**

An array of `filterId` matching the provided data (and/or documentId, if any).

#### `validate`

Tests the provided filters without storing them in the system, to check whether they are well-formed or not.

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
|`filters`|`object`| Filters in [Kuzzle DSL](#filtering-syntax) format |

**Returns**

A resolved promise if the provided filters are valid, or a rejected one with the appropriate error object otherwise.

### `Request`

This constructor is used to transform an [API call](/api-reference/?others#common-attributes) into a standardized Kuzzle request. This object is updated along the request process to reflect the current state of the request, and is ultimately used to serialize a standard [Kuzzle response](/api-reference/?others#kuzzle-response) to be forwarded to the requesting client.

Network protocol specific headers can be added to the response. If the protocol can handle them, these headers will be used to configure the response sent to the client.    
As Kuzzle supports the HTTP protocol natively, this object handles HTTP headers special cases. Other network protocols headers are stored in raw format, and protocol plugins need to handle their own specific headers manually.

For more information about this object, please check [our detailed documentation](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#request).

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
|`request`|`Request`| `Request` object used to derive a new object instance |
|`data`|`object`| Passed to [RequestInput](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#modelsrequestinput) constructor |
| `options` | `object` | Optional initialization parameters |

`RequestContext` is usually obtained with `context.accessors.router.newConnection`.  

If a raw `options` object is provided, it may contain:

| Name | Type | Description                      |
|------|------|----------------------------------|
| `connectionId` | `string` | Passed to [RequestContext](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#modelsrequestcontext) constructor |
| `error` | `KuzzleError` or `Error` | Invokes [setError](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#seterrorerror) at initialization |
| `protocol` | `string` | Passed to [RequestContext](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#modelsrequestcontext) constructor |
| `requestId` | `string` | Initializes the `id` property |
| `result` | *(varies)* | Invokes [setResult](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#setresultresult-options--null) at initialization |
| `status` | `integer` | HTTP error code |
| `token` | `object` | Passed to [RequestContext](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#modelsrequestcontext) constructor |
| `user` | `object` | Passed to [RequestContext](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#modelsrequestcontext) constructor |


Here is an example:

```js
let derivedRequest = new context.constructors.Request(request, {
  controller: 'write',
  action: 'create',
  index: 'foo',
  collection: 'bar',
  _id: 'some document ID',
  body: {
    document: 'content'
  },
  metadata: {
    some: 'volatile data'
  }
});
```

**Attributes**

Read-only

| Name | Type | Description                      |
|------|------|----------------------------------|
| `timestamp` | integer | Request creation timestamp |

Writable

| Name | Type | default | Description                      |
|------|------|---------|----------------------------------|
| `context` | `RequestContext` | [RequestContext](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#modelsrequestcontext) object | Request connection context |
| `error` | `KuzzleError` | `null` | Request error, if any |
| `id` | `string` | Auto-generated UUID | Request unique identifier |
| `input` | `RequestInput` | [RequestInput](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#modelsrequestinput) object | Request's parameters |
| `result` | *(varies)* | `null` | Request result, if any |
| `status` | `integer` | `102` | HTTP status code |

Any undefined attribute from the list above will be set to null.

Please refer to our [API Reference](/api-reference/?others) for a complete list of controllers-actions and their purposes.

Getters

| Name | Type | Description                      |
|------|------|----------------------------------|
| `response` | `RequestResponse` | Response view of the request, standardized as the expected [Kuzzle API response](/api-reference/?others#kuzzle-response) |


#### `response.getHeader`

Returns the value registered for the response header `name`

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
| `name` | `string` | Header name |

#### `response.getHeaders()`

Returns an object describing all currently registered headers on that response.

```
if (request.context.protocol === 'http') {
  request.response.setHeader('Content-Type', 'text/plain');

  /*
    Prints:
    { "Content-Type": "text/plain" }
   */
  console.log(request.response.getHeaders());
}
```

#### `response.removeHeader`

Removes header `name` from the response headers.

#### `setHeader`

Adds a header `name` with value `value` to the response headers.

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
| `name` | `string` | Header name |
| `value` | `string` | Header value |

For standard headers, if `name` already exists, then the provided `value` will be concatenated to the existing value, separated by a comma.  

As Kuzzle implements HTTP natively, this behavior changes for some HTTP specific headers, to comply with the norm. For instance `set-cookie` values are amended in an array, and other headers like `user-agent` or `host` can store only 1 value.


#### `serialize`

Serializes the `Request` object into a pair of POJOs that can be sent across the network, and then used to rebuild another equivalent `Request` object.


```js
let foo = request.serialize();
let bar = new context.constructors.Request(request, foo.data, foo.options);
```

#### `setError`

Adds an error to the request, and sets the request's status to the error one.

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
| `error` | `KuzzleError` or `Error` | Error object to set |

If a `KuzzleError` is provided, the request's status attribute is set to the error one.

Otherwise, the provided error is encapsulated into a [InternalError](https://github.com/kuzzleio/kuzzle-common-objects/blob/master/README.md#errorsinternalerror) object, and the request's status is set to 500.

#### `setResult`

Sets the request's result.

**Arguments**

| Name | Type | Description                      |
|------|------|----------------------------------|
| `result` | *(varies)* | Request's result |
| `options` | `object` | Optional parameters |

The `options` argument may contain the following properties:

| Name | Type | Description                      | Default |
|------|------|----------------------------------|---------|
| `status` | `integer` | HTTP status code | `200` |
| `headers` | `object` | Protocol specific headers | `null` |
| `raw` | `boolean` | Asks Kuzzle to send the provided result directly, instead of encapsulating it in a Kuzzle JSON response | `false` |

## Errors

### `KuzzleError`

Inherits from `Error`. Abstract class inherited by Kuzzle error objects.

This class should only be used to create new Kuzzle error objects.


### `BadRequestError`

**Status Code:** `400`

Used to notify about badly formed requests.

```js
var err = new context.errors.BadRequestError('error message');
```

### ForbiddenError`

**Status Code:** `403`

Used when a user tries to use resources beyond his access rights.

```js
var err = new context.errors.ForbiddenError('error message');
```

### `GatewayTimeoutError`

**Status Code:** `504`

Used when a plugin takes too long to perform a task.

```js
var err = new context.errors.GatewayTimeoutError('error message');
```

### `InternalError`

**Status Code:** `500`

Standard generic error. Used for uncatched exceptions.

```js
var err = new context.errors.InternalError('error message');
```

### `NotFoundError`

**Status Code:** `404`

Used when asked resources cannot be found.

```js
var err = new context.errors.NotFoundError('error message');
```

### `ParseError`

**Status Code:** `400`

Used when a provided resource cannot be interpreted.

```js
var err = new context.errors.ParseError('error message');
```

### `PartialError`

**Status Code:** `206`

Used when a request only partially succeeded.

The constructor takes an additional `array` argument containing a list of failed parts.

```js
var err = new context.errors.PartialError('error message', [{this: 'failed'}, {andThis: 'failed too'}]);
```


### `PluginImplementationError`

**Status Code:** `500`

Used when a plugin fails.

```js
var err = new context.errors.PluginImplementationError('error message');
```

### `ServiceUnavailableError`

**Status Code:** `503`

Used when a resource cannot respond because it is temporarily unavailable.

```js
var err = new context.errors.ServiceUnavailableError('error message');
```

### `SizeLimitError`

**Status Code:** `413`

Used to notify about requests exceeding maximum limits.

```js
var err = new context.errors.SizeLimitError('error message');
```

### `UnauthorizedError`

**Status Code:** `401`

Used when a user fails a login attempt.

```js
var err = new context.errors.UnauthorizedError('error message');
```
