# vuex-undo-redo

A Vue.js plugin that allows you to undo or redo a mutation.
Based on [anthonygore/vuex-undo-redo](https://github.com/anthonygore/vuex-undo-redo), but using another idea for undo or redo a mutations.


## Installation

```js
yarn add vuex-undo-redo
```

### Browser

```html
<script type="text/javascript" src="node_modules/vuex-undo-redo/dist/vuex-undo-redo.min.js"></script>
```

### Usage

Since it's a plugin, use it like:

```js
import VuexUndoRedo from 'vuex-undo-redo';

Vue.use(VuexUndoRedo, {
  rules: [
    {
      from: 'INSERT',
      to: `DELETE`,
    },
    {
      from: 'DELETE',
      to: 'INSERT',
    },
    {
      from: 'UPDATE',
      to: 'UPDATE',
      mapPayload: { oldValues: 'newValues', newValues: 'oldValues' },
    },
  ],
});

```

You must, of course, have the Vuex plugin installed as well, and it must be intalled before this plugin.

```js
new Vuex.Store({
  state: {
    elements: [],
  },
  mutations: {
    /* "element" should be non-reactive */
    INSERT(state, { index, element }) {
      state.elements.splice(index, 0, element);   
    },
    /* "element" should be non-reactive */
    DELETE(state, { index, element }) {
      state.elements.splice(index, 1);
    },
    /* "newValues" and "oldValues" should be non-reactive */
    UPDATE(state, { index, newValues, oldValues }) {
      const element = state.elements[index];
      for (const [key, value] of Object.entries(newValues)) {
        element[key] = value;
      }
    },
  },
});
```

## API

### Computed properties

`canUndo` a boolean which tells you if the state is undo-able

`canRedo` a boolean which tells you if the state is redo-able

### Methods

`undo` undoes the last mutation

`redo` redoes the last mutation

`resetUndoRedo` resets the all history
