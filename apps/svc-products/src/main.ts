import { ApolloError, ApolloServer } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import * as express from 'express'
import * as http from 'http'
import { blueBright, green, magentaBright, redBright } from 'chalk'
import { schema } from './app/schema'
import mongoose from 'mongoose'

const mongodbURI = process.env.MONGODB_URI
const dbName = process.env.MONGODB_NAME

const connectDB = async (mongodbURI: string, dbName: string) => {
	try {
		await mongoose.connect(mongodbURI, { autoIndex: false, dbName }, (error) => {
			if (error) {
				console.log(redBright(error))
			}
		})
		console.log(blueBright('🐣 mongodb database started'))
		console.log(green(`🙉 dbURL `, mongodbURI))
		console.log(green(`🙉 dbName `, dbName))
		return mongoose.connection
	} catch (error) {
		console.log(error)
		return undefined
	}
}

async function startApolloServer() {
	try {
		await connectDB(mongodbURI, dbName)

		const app = express()
		const httpServer = http.createServer(app)
		const server = new ApolloServer({
			schema: schema,
			csrfPrevention: true,
			cache: 'bounded',
			plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		})

		await server.start()

		server.applyMiddleware({ app })

		await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve))

		console.log(magentaBright`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
	} catch (err) {
		throw new ApolloError('Something went wrong in Apollo')
	}
}

const server = startApolloServer()

export default server
