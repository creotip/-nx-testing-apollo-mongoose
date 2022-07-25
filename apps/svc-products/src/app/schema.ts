import mongoose from 'mongoose'
import { composeMongoose } from 'graphql-compose-mongoose'
import { schemaComposer } from 'graphql-compose'

export interface IProduct {
	title: string
	price: number
	description: string
	category: string
	image: string
}

export interface IProductDocument extends IProduct, mongoose.Document {}

export const ProductSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
})

export const ProductModel = mongoose.model<IProductDocument>('Product', ProductSchema)

const customizationOptions = {}

export const ProductTC = composeMongoose(ProductModel, customizationOptions)

schemaComposer.Query.addFields({
	productOne: ProductTC.mongooseResolvers.findOne(),
	productMany: ProductTC.mongooseResolvers.findMany(),
	productCount: ProductTC.mongooseResolvers.count(),
})

schemaComposer.Mutation.addFields({
	productCreateOne: ProductTC.mongooseResolvers.createOne(),
	productUpdateOne: ProductTC.mongooseResolvers.updateOne(),
	productUpdateMany: ProductTC.mongooseResolvers.updateMany(),
	productRemoveOne: ProductTC.mongooseResolvers.removeOne(),
})

export const schema = schemaComposer.buildSchema()
