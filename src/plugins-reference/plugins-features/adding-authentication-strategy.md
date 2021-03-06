---
layout: full.html
algolia: true
title: Adding an authentication strategy
order: 400
---

# Adding an authentication strategy

Kuzzle handles users security and authentication. The supported authentication strategies can be extended by Plugins.

Any strategy supported by [Passport](http://passportjs.org/) can be used to extend Kuzzle supported strategies, like we did with our official [OAUTH2 Authentication plugin](https://github.com/kuzzleio/kuzzle-plugin-auth-passport-oauth).

---

## Choose or implement a Passport strategy

[Passport](http://passportjs.org) supports a wide range of authentication strategies. If that is not enough, you can also implement your own strategy for your authentication Plugin.

In any case, the chosen strategy must be available in the Plugin local directory when Kuzzle installs it, either by adding the strategy in the Plugin's NPM dependencies, or by including the strategy code directly in the Plugin repository.

---

## Expose authentication strategies

There are two ways of declaring authentication strategies:

* By exposing a `strategies` object in an authentication plugin instance, listing strategies to explose and their properties. That object cannot be empty, and must contain one attribute per added strategy, with the attribute name used as the strategy name;
* By [dynamically add or remove strategies]({{ site_base_path }}plugins-reference/plugins-context/accessors/#strategies).

Whether strategies are statically or dynamically added, a properties object must be provided for each one of them. That object must be of the following structure:

* config: an object containing the strategy configuration 
  * constructor: The constructor of the Passport strategy
  * strategyOptions: The options provided to the Passport strategy constructor
  * authenticateOptions: The options provided to the Passport's [authenticate method](http://passportjs.org/docs/authenticate).
  * fields: The list of fields that can be provided to the plugin.
* methods: an object containing the list of exposed methods
  * afterRegister: The name of the `afterRegister` function in the plugin object.
  * create: [mandatory] The name of the `create` function in the plugin object.
  * delete: [mandatory] The name of the `delete` function in the plugin object.
  * exists: [mandatory] The name of the `exists` function in the plugin object.
  * getById: The name of the `getById` function in the plugin object.
  * getInfo: The name of the `getInfo` function in the plugin object.
  * update: [mandatory] The name of the `update` function in the plugin object.
  * validate: [mandatory] The name of the `validate` function in the plugin object.
  * verify: [mandatory] The name of the `verify` function in the plugin object.

Even if each strategy must declare its own set of properties, a same strategy method can be used by multiple strategies.

---

## The verify function

You have to implement a [`verify` function](http://passportjs.org/docs/configure) (its name depends on the configuration provided in the `strategies` attribute), which will be used by Kuzzle to authorize or to deny access to a user.

The number of arguments taken by this `verify` function depends on the authentication strategy. For instance, a `local password` strategy needs the `verify` callback to be provided with an `username` and his `password`.

Here is the generic signature of the `verify` function you have to implement:

`verify(payload, ...)`

* `payload` is the login request made to passport
* `...`: varies, depending on the used strategy

The supplied `payload` is a simple JSON object, containing the following attributes:
* `original`: the [Request object]({{ site_base_path }}plugins-reference/plugins-context/constructors/#request) containing the login request
* `query`: a direct link to `original.input.args`, containing the optional request arguments
* `body`: a direct link to `original.input.body`, containing the request body content

The function **must** return a `Promise` that resolves to an object that can contain two attributes: `kuid` and `message`. If the user is authenticated, the `kuid` attribute must contain the [kuid]({{ site_base_path }}guide/kuzzle-depth/authentication/#the-kuzzle-user-identifier-kuid) of the user, else the `kuid` should be null and the `message` attribute must contain a string giving the reason the user can not be authenticated. The function should reject the Promise if an error occurs (note: an authentication rejection is *not* an error).

---

## The exists function

You have to implement an `exists` function (its name depends on the configuration provided in the `strategies` attribute), which will be used by Kuzzle to check whether a user has credentials using that strategy or not.

Here is the generic signature of the `exists` function you have to implement:

`exists (request, kuid, strategy)`

* `request` is the request made to Kuzzle (see [the `Request` documentation]({{ site_base_path }}plugins-reference/plugins-context/constructors/#request)).
* `kuid` is the user [`<kuid>`]({{ site_base_path }}guide/kuzzle-depth/authentication/#the-kuzzle-user-identifier-kuid).
* `strategy` the name of the strategy

The function **must** return a `Promise` that resolves to a boolean depending on the user ability to authenticate with a strategy.

---

## The create function

You have to implement an `create` function (its name depends on the configuration provided in the `strategies` attribute), used by Kuzzle to add credentials to a user using this strategy.

Here is the generic signature of the `create` function you have to implement:

`create (request, credentials, kuid, strategy)`

* `request` is the request made to Kuzzle (see [the `Request` documentation]({{ site_base_path }}plugins-reference/plugins-context/constructors/#request)).
* `credentials` is the content of the credentials to create, that have already been passed to your `validate` function.
* `kuid` is the user [`<kuid>`]({{ site_base_path }}guide/kuzzle-depth/authentication/#the-kuzzle-user-identifier-kuid).
* `strategy` the name of the strategy

The function **must** return a `Promise` that resolves to an object that contains **non sensitive** information of the object (can be an empty object).

<aside class="warning">
  The credentials have to be persisted, either by using the <a href="{{ site_base_path }}plugins-reference/plugins-context/constructors/#repository">Repository constructor</a>, or any external service.
</aside>

---

## The update function

You have to implement an `update` function (its name depends on the configuration provided in the `strategies` attribute), used by Kuzzle to update a user's credentials to this strategy.

Here is the generic signature of the `update` function you have to implement:

`update (request, credentials, kuid, strategy)`

* `request` is the request made to Kuzzle (see [the `Request` documentation]({{ site_base_path }}plugins-reference/plugins-context/constructors/#request)).
* `credentials` is the content of the credentials to create, that have already been passed to your `validate` function.
* `kuid` is the user [`<kuid>`]({{ site_base_path }}guide/kuzzle-depth/authentication/#the-kuzzle-user-identifier-kuid).
* `strategy` the name of the strategy

The function **must** return a `Promise` that resolves to an object that contains **non sensitive** information of the object (can be an empty object).

<aside class="warning">
  The credentials have to be persisted, either by using the <a href="{{ site_base_path }}plugins-reference/plugins-context/constructors/#repository">Repository constructor</a>, or any external service.
</aside>

---

## The delete function

You have to implement a `delete` function (its name depends on the configuration provided in the `strategies` attribute), used by Kuzzle to delete a user's credentials to this strategy.

Here is the generic signature of the `delete` function you have to implement:

`delete (request, kuid, strategy)`

* `request` is the request made to Kuzzle (see [the `Request` documentation]({{ site_base_path }}plugins-reference/plugins-context/constructors/#request)).
* `kuid` is the user [`<kuid>`]({{ site_base_path }}guide/kuzzle-depth/authentication/#the-kuzzle-user-identifier-kuid).
* `strategy` the name of the strategy

The function **must** return a `Promise` that resolves to any value if deletion succeeds.

---

## The getInfo function

You may implement a `getInfo` function (its name depends on the configuration provided in the `strategies` attribute), used by Kuzzle to get informations about a user's credentials to this strategy. 

<aside class="warning">
Kuzzle will NEVER expose data managed by plugins by itself. Plugins are entirely responsible for the data they expose.<br/>
For security reasons, only NON SENSITIVE informations should be returned by that method.
</aside>

Here is the generic signature of the `getInfo` function you have to implement:

`getInfo (request, kuid, strategy)`

* `request` is the request made to Kuzzle (see [the `Request` documentation]({{ site_base_path }}plugins-reference/plugins-context/constructors/#request)).
* `kuid` is the user [`<kuid>`]({{ site_base_path }}guide/kuzzle-depth/authentication/#the-kuzzle-user-identifier-kuid).
* `strategy` the name of the strategy

The function **must** return a `Promise` that resolves to an object that contains **non sensitive** information of the object (can be an empty object).

<aside class="info">
  If no getInfo function is provided, an empty object will be returned by controllers that use it.
</aside>

---

## The getById function

You may implement a `getById` function (its name depends on the configuration provided in the `strategies` attribute), used by Kuzzle to get informations about a user's credentials to this strategy searching by the strategy storage identifier (`_id`). For security reasons, only **non sensitive** informations should be returned.

Here is the generic signature of the `getById` function you have to implement:

`getById (request, id, strategy)`

* `request` is the request made to Kuzzle (see [the `Request` documentation]({{ site_base_path }}plugins-reference/plugins-context/constructors/#request)).
* `id` is the user's storage identifier in the strategy.
* `strategy` the name of the strategy

The function **must** return a `Promise` that resolves to an object that contains **non sensitive** information of the object (can be an empty object).

<aside class="info">
  If no getById function is provided, an empty object will be returned by controllers that use it.
</aside>

---

## The afterRegister function

You may implement a `afterRegister` function (its name depends on the configuration provided in the `strategies` attribute), which will be called once the strategy constructor has been build

Here is the generic signature of the `afterRegister` function you have to implement:

`afterRegister (constructedStrategy)`

* `constructedStrategy` is the instance of the Passport strategy constructor.

The function **may** return any value as it will be ignored.

<aside class="info">
  If no afterRegister function is provided, Kuzzle won't try to call it, and register will process as expected.
</aside>

---

## The validate function

You have to implement a `validate` (its name depends on the configuration provided in the `strategies` attribute), which will be used by Kuzzle to check if the provided user's credentials to this strategy are well-formed, and ensure that every values you want are unique.

Here is the generic signature of the `validate` function you have to implement:

`validate (request, credentials, kuid, strategy, isUpdate)`

* `request` is the request made to Kuzzle (see [the `Request` documentation]({{ site_base_path }}plugins-reference/plugins-context/constructors/#request)).
* `credentials` is the content of the credentials to create or update.
* `kuid` is the user [`<kuid>`]({{ site_base_path }}guide/kuzzle-depth/authentication/#the-kuzzle-user-identifier-kuid).
* `strategy` the name of the strategy
* `isUpdate` is true if `validate` is called during an update.

The function **must** return a `Promise` that resolves or rejects with an error explaining the reason.

<aside class="warning">
  Validate can be called during an update with partial information. The validation should behave accordingly when **isUpdate** is **true**, knowing that mandatory information should already have been stored during a previous create call.
</aside>

---


## TL;DR plugin skeleton

Here is a skeleton example of an authentication plugin:

```javascript
const StrategyConstructor = require('some-passport-strategy');

/**
 * @class AuthenticationPlugin
 */
class AuthenticationPlugin {
  /**
   * @constructor
   */
  constructor() {}

  /**
   * @param {object} customConfig
   * @param {KuzzlePluginContext} context
   * @returns {*}
   */
  init (customConfig, context) {
    this.strategies = {
      // The name of the strategy
      strategyName: {
        config: {
          // The constructor of the passport strategy 
          constructor: StrategyConstructor,

          // Options provided to the strategy constructor at instantiation
          strategyOptions: {},

          // Options provided to the authenticate function during the authentication process
          authenticateOptions: {
            scope: []
          },

          // The list of fields that have to be provided in the credentials
          fields: ['login', 'password']
        },
        methods: {
          // (optional) The name of the afterRegister function
          afterRegister: 'afterRegister',
          // The name of the create function
          create: 'create',
          // The name of the delete function
          delete: 'delete',
          // The name of the exists function
          exists: 'exists',
          // (optional) The name of the getById function
          getById: 'getById',
          // (optional) The name of the getInfo function
          getInfo: 'getInfo',
          // The name of the update function
          update: 'update',
          // The name of the validate function
          validate: 'validate',
          // The name of the verify function
          verify: 'verify'
        }
      }
    };
  }

  /**
   * Optional.
   * Called after the strategy has been built with the constructor
   *
   * @param {*} constructedStrategy
   * @returns {Promise<object>}
   */
  afterRegister (constructedStrategy) {
    // do some action
    Promise.resolve(/* any value */);
  }

  /**
   * Persists the provided credentials in some way
   * Must keep a link between the persisted credentials
   * and the kuid
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @returns {Promise<object>}
   */
  create (request, credentials, kuid) {
    // persist credentials
    Promise.resolve(/* non sensitive credentials info */);
  }

  /**
   * Removes the user's stored credentials from
   * the plugin persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @returns {Promise<object>}
   */
  delete (request, kuid) {
    // remove credentials
    Promise.resolve(/* any value */);
  }

  /**
   * Checks if user's credentials exist in the persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @returns {Promise<boolean>}
   */
  exists (request, kuid) {
    // check credentials existence
    Promise.resolve(/* true|false */);
  }

  /**
   * Optional.
   * Retrieves the non sensitive user's credentials information
   * from the persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @returns {Promise<object>}
   */
  getInfo (request, kuid) {
    // retrieve credentials
    Promise.resolve(/* non sensitive credentials info */);
  }

  /**
   * Optional.
   * Retrieves the non sensitive user's credentials information
   * from the persistence layer using the strategy internal id
   *
   * @param {KuzzleRequest} request
   * @param {string} id
   * @returns {Promise<object>}
   */
  getById (request, id) {
    // retrieve credentials
    Promise.resolve(/* non sensitive credentials info */);
  }

  /**
   * Updates the user's credentials information in the
   * persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @returns {Promise<object>}
   */
  update (request, credentials, kuid) {
    // update credentials
    Promise.resolve(/* non sensitive credentials info */);
  }

  /**
   * Validates credentials validity conforming to the
   * authentication strategy rules (mandatory fields,
   * password length, username uniqueness, ...)
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @param {string} strategy
   * @param {boolean} isUpdate
   * @returns {Promise<boolean>}
   */
  validate (request, credentials, kuid, strategy, isUpdate) {
    // validate credentials
    Promise.resolve(/* true|false */);
  }

  /**
   * Provided to the Passport strategy as verify function
   * Should return the kuid if the user can authentify
   * or an object with the login failure reason as message attribute
   *
   * @param {KuzzleRequest} request
   * @param {*[]} credentials - provided arguments depends on the Passport strategy
   * @returns {Promise<string|{message: string}>}
   */
  verify (request, ...credentials) {
    // verify if the user can authentify
    const kuid = getUserIdFromCredentials(credentials);

    if (kuid) {
      return Promise.resolve(kuid);
    }

    return Promise.resolve({message: 'Login failed - You shall not pass! Reason: ...'});
  }
}

// Exports the plugin objects, allowing Kuzzle to instantiate it
module.exports = AuthenticationPlugin;
```
