import {ApolloServer, UserInputError, gql} from "apollo-server"
import axios from "axios"

const persons = [
    {
        name: "Wei",
        city: "Madrid",
        id: "123"
    },
    {
        name: "Victor",
        city: "Bosa",
        id: "456"
    },
    {
        name: "Vivi",
        city: "Suba",
        id: "789"
    },
    {
        name: "Harby",
        city: "Ibage",
        id: "148"
    },
]

const typeDefs = gql`
    enum YesNo{
        YES
        NO
    }

    type Person{
        name: String!
        city: String
        id: ID!
    }

    type Query{
        personCount:Int!
        allPersons(city: YesNo): [Person]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            city: String
            id: ID!
        ):Person
    }
`


const resolvers ={
    Query:{
        personCount: () => persons.length,
        allPersons: async(root, args) => {
            const {data: personsFromRestApi} = await axios.get('http://localhost:3000/persons')
            console.log(personsFromRestApi)

             if (!args.city) return personsFromRestApi

             const byCity = person =>
                args.city == "YES" ? person.city : !person.city

            return personsFromRestApi.filter(byCity)
        },
        findPerson: (root, args) => {
            const {name} = args
            return persons.find(person => person.name == name)
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            if(persons.find(p => p.name == args.name)){
                throw new UserInputError('Name is not valid, name exist previusly', {
                    invalidArgs: args.name
                })
            }
            const person = {...args}
            persons.push(person)
            return person
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({url}) => {
    console.log(` Server ready at ${url}`)
})