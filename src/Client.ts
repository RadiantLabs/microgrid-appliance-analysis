import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-client-preset'
import { ApolloClient } from 'apollo-client'
import { withClientState } from 'apollo-link-state'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { compose } from 'recompose'

const todoDefaults = {
  currentTodos: [],
}

const todoQuery = gql`
  query GetTodo {
    currentTodos @client
  }
`

const clearTodoQuery = gql`
  mutation clearTodo {
    clearTodo @client
  }
`

const addTodoQuery = gql`
  mutation addTodo($item: String) {
    addTodo(item: $item) @client
  }
`

const addTodo = (_obj: any, { item }, { cache }) => {
  const query = todoQuery
  // Read the todo's from the cache
  const { currentTodos } = cache.readQuery({ query })

  // Add the item to the current todos
  const updatedTodos = currentTodos.concat(item)

  // Update the cached todos
  cache.writeQuery({ query, data: { currentTodos: updatedTodos } })

  return null
}

const clearTodo = (_obj: any, _args, { cache }) => {
  cache.writeQuery({ query: todoQuery, data: todoDefaults })
  return null
}

// Set up Cache
const cache = new InMemoryCache()

// Set up Local State
const stateLink = withClientState({
  cache,
  defaults: todoDefaults,
  resolvers: {
    Mutation: {
      addTodo,
      clearTodo,
    },
  },
})

// Initialize the Apollo Client
const Client = new ApolloClient({
  link: ApolloLink.from([stateLink]),
  cache,
})

const todoQueryHandler: any = {
  props: ({ ownProps, data: { currentTodos = [] } }) => ({
    ...ownProps,
    currentTodos,
  }),
}

const withTodo = compose<{}, {}>(
  graphql(todoQuery, todoQueryHandler),
  graphql(addTodoQuery, { name: 'addTodoMutation' }),
  graphql(clearTodoQuery, { name: 'clearTodoMutation' })
)

export { Client, withTodo }
