var express = require('express');
var exphbs  = require('express-handlebars');

// SDK de Mercado Pago
var mercadopago = require('mercadopago');

// Inicio Mercado Pago
mercadopago.configure({
    access_token: 'APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
});
 
var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {
    // Crea un objeto de preferencia
    let preference = {
        items: [
            {
                id: '1234',
                title: req.query.title,
                description: 'Dispositivo móvil de Tienda e-commerce',
                picture_url: req.protocol + '://' + req.headers.host + '/' + req.query.img,
                unit_price: parseFloat(req.query.price),
                quantity: parseInt(req.query.unit),
            }
        ],
        payer: {
            name: 'Lalo',
            surname: 'Landa',
            email: 'test_user_63274575@testuser.com',
            phone: {
                area_code: '11',
                number: 22223333
            },
            address: {
                zip_code: '1111',
                street_name: 'False',
                street_number: 123
            }
        },
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: 'amex'
                }
            ],
            excluded_payment_types: [
                {
                    id: 'atm'
                }
            ],
            installments: 6
        },
        back_urls: {
            success: req.protocol + '://' + req.headers.host + '/success',
            pending: req.protocol + '://' + req.headers.host + '/pending',
            failure: req.protocol + '://' + req.headers.host + '/failure'
        },
        notification_url: req.protocol + '://' + req.headers.host + '/pay-update',
        auto_return: 'approved',
        collector_id: 469485398,
        external_reference: 'cristhianp@tesubis.com'
    };

    console.log('preference', preference);
    
    mercadopago.preferences.create(preference)
    .then(function(response){
        req.query.init_point = response.body.init_point;
        res.render('detail', req.query);
    }).catch(function(error){
        console.log(error);
    });
});

app.get('/success', function (req, res) {
    console.log('success');
    res.send("<span>El pago fue exitoso.</span><br />" +
             "<span>collection_id = " + req.query.collection_id + "</span><br />" +
             "<span>collection_status = " + req.query.collection_status + "</span><br />" +
             "<span>external_reference = " + req.query.external_reference + "</span><br />" +
             "<span>payment_type = " + req.query.payment_type + "</span><br />" +
             "<span>preference_id = " + req.query.preference_id + "</span><br />" +
             "<span>site_id = " + req.query.site_id + "</span><br />" +
             "<span>processing_mode = " + req.query.processing_mode + "</span><br />" +
             "<span>merchant_account_id = " + req.query.merchant_account_id + "</span>" +
             "<br /><br /><a href='" + req.protocol + "://" + req.headers.host + "'>Volver</a>");
});

app.get('/pending', function (req, res) {
    console.log('pending');
    res.send("<span>El pago está pendiente.</span>" +
             "<br /><br /><a href='" + req.protocol + "://" + req.headers.host + "'>Volver</a>");
});

app.get('/failure', function (req, res) {
    console.log('failure');
    res.send("<span>El pago ha fallado.</span>" +
             "<br /><br /><a href='" + req.protocol + "://" + req.headers.host + "'>Volver</a>");
});

app.post('/pay-update', function (req, res) {
    console.log('pay-update');
    
    console.log(req.body);
    
    res.status(201).send("OK");
});

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));
 
app.listen(process.env.PORT || 3000)