import { MongoMemoryServer } from 'mongodb-memory-server-core'
import * as mongoose from 'mongoose'
import { ApolloServer } from 'apollo-server-express'
import { connectDB } from './main'
import type { IProduct } from './app/schema'
import { ProductModel, schema } from './app/schema'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'
import * as express from 'express'
import * as http from 'http'

jest.setTimeout(20000)
jest.retryTimes(3)

let mongod: MongoMemoryServer
let server: ApolloServer

const mockDBName = 'shop'

beforeAll(async () => {
	let mongoUri = ''
	mongod = await MongoMemoryServer.create()
	mongoUri = mongod.getUri()
	await connectDB(mongoUri, mockDBName)

	const app = express()
	const httpServer = http.createServer(app)

	server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	})
})

async function closeMongoConnection(
	mongod: MongoMemoryServer,
	mongooseConnection: mongoose.Connection
) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve()
		}, 2000)
		try {
			mongod?.stop().then(() => {
				mongooseConnection.close().then(() => {
					resolve()
				})
			})
		} catch (err) {
			console.error(err)
		}
	})
}

afterAll(async () => {
	await closeMongoConnection(mongod, mongoose.connection)
	await server.stop()
})

describe('Integration test with apollo server and MongoMemoryServer', () => {
	const mockProduct: IProduct & { _id: string } = {
		title: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops',
		price: 109.99,
		description:
			'Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday',
		category: "men's clothing",
		image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
		_id: '62d6b1998fb10a613f67a021',
	}

	const publishedProduct = new ProductModel(mockProduct)

	it('should ', async () => {
		await publishedProduct.save()

		const result = await server.executeOperation({
			query: `
        query Query {
          productMany {
            title
            price
            description
            category
            image
            _id
              }
          }
			`,
		})

		expect(result.data.productMany).toHaveLength(1)
		expect(result.data.productMany[0]).toMatchObject(mockProduct)
	})
})
