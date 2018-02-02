var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.get('/', function(req, res, next) {
	let url = 'https://api.mercadolibre.com/sites/MLA/search?q=:' + req.query.q;
	console.log(url);
	request(url, function(error, requests, response) {
		var data = {};
		var books = [];
		var categories = [];
		var dataComplete = JSON.parse(response);
		dataComplete.results.forEach(function(option, index, array) {
			if (categories.indexOf(option.category_id) < 1) {
				categories.push(option.category_id);
			}
			var amount = parseInt(option.installments.amount.toString().split(".")[0]);
			var decimals = parseInt(option.installments.amount.toString().split(".")[1]);
			books.push({
				"id": option.id, 
				"title": option.title, 
				"price": {
					"currency": option.currency_id, 
					"amount": amount,
					"decimals": decimals
				},
				"picture": option.thumbnail,
				"condition": option.condition,
				"free_shipping": option.shipping.free_shipping
			});
		});

		data.categories = categories;
		data.items = books;
		res.json(data);
	});
// }
});

router.get('/:id', function(req, res, next) {
	let id = req.params.id
	let urlItem = 'https://api.mercadolibre.com/items/' + id;
	console.log(urlItem);
	var data = {};
	var book = {};
	request(urlItem, function(error, requests, response) {
		var dataComplete = JSON.parse(response);
		book.id = dataComplete.id;
		book.title = dataComplete.title;
		book.price = {
			"currency": dataComplete.currency_id
		}
		book.picture = dataComplete.pictures[0].secure_url;
		book.condition = dataComplete.condition;
		book.free_shipping = dataComplete.shipping.free_shipping;
		book.sold_quantity = dataComplete.sold_quantity;
		let urlDescription = urlItem + '/description';
		request(urlDescription, function(error, requests, response) {
			var json = JSON.parse(response);
			var description = json.plain_text;
			book.description = description;
			data.item = book;
			res.json(data);
		});
	});
});

module.exports = router;