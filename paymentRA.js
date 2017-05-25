function initPaymentRequest() {
    let networks = ['amex', 'diners', 'discover', 'jcb', 'mastercard', 'unionpay',
        'visa', 'mir'];
    let types = ['debit', 'credit', 'prepaid'];
    let supportedInstruments = [{
        supportedMethods: networks
    }, {
        supportedMethods: ['basic-card'],
        data: {supportedNetworks: networks, supportedTypes: types},
    }];

    let details = {
        total: {label: 'Donation', amount: {currency: 'RUB', value: '5500.00'}},
        displayItems: [
            {
                label: 'Original donation amount',
                amount: {currency: 'RUB', value: '6500.00'}
            },
            {
                label: 'Friends and family discount',
                amount: {currency: 'RUB', value: '-1000.00'}
            }
        ]
    };

    return new PaymentRequest(supportedInstruments, details);
}

function initPaymentRequestWithOptions() {
    let networks = ['amex', 'diners', 'discover', 'jcb', 'mastercard', 'unionpay',
        'visa', 'mir'];
    let types = ['debit', 'credit', 'prepaid'];
    let supportedInstruments = [{
        supportedMethods: networks,
    }, {
        supportedMethods: ['basic-card'],
        data: {supportedNetworks: networks, supportedTypes: types},
    }];

    let details = {
        total: {label: 'Donation', amount: {currency: 'EUR', value: '55.00'}},
        displayItems: [
            {
                label: 'Original donation amount',
                amount: {currency: 'EUR', value: '65.00'},
            },
            {
                label: 'Friends and family discount',
                amount: {currency: 'EUR', value: '-10.00'},
            },
        ],
    };

    let options = {
        requestPayerName: true,
        requestPayerEmail: true,
    };

    return new PaymentRequest(supportedInstruments, details, options);
}

function initPaymentRequestWithShipping() {
    let networks = ['amex', 'diners', 'discover', 'jcb', 'mastercard', 'unionpay',
        'visa', 'mir'];
    let types = ['debit', 'credit', 'prepaid'];
    let supportedInstruments = [{
        supportedMethods: networks,
    }, {
        supportedMethods: ['basic-card'],
        data: {supportedNetworks: networks, supportedTypes: types},
    }];

    let details = {
        total: {label: 'Donation', amount: {currency: 'USD', value: '55.00'}},
        displayItems: [
            {
                label: 'Original donation amount',
                amount: {currency: 'USD', value: '65.00'},
            },
            {
                label: 'Friends and family discount',
                amount: {currency: 'USD', value: '-10.00'},
            },
            {
                label: 'Shipping',
                amount: {currency: 'USD', value: '0.00'},
                pending: true,
            }
        ],
        shippingOptions: [
        {
            id: 'standard',
            label: 'Standard shipping',
            amount: {currency: 'USD', value: '0.00'},
        },
        {
            id: 'express',
            label: 'Express shipping',
            amount: {currency: 'USD', value: '12.00'}
        },
    ],
    };

    let options = {requestShipping: true};

    let request = new PaymentRequest(supportedInstruments, details, options);

    request.addEventListener('shippingaddresschange', function(evt) {
        evt.updateWith(Promise.resolve(details));
    });

    request.addEventListener('shippingoptionchange', function(evt) {
        evt.updateWith(new Promise(function(resolve, reject) {
            updateDetails(details, request.shippingOption, resolve, reject);
        }));
    });

    return request;
}

function updateDetails(details, shippingOption, resolve, reject) {
    if (shippingOption === 'standard') {
        selectedShippingOption = details.shippingOptions[0];
        otherShippingOption = details.shippingOptions[1];
        details.total.amount.value = '55.00';
    } else if (shippingOption === 'express') {
        selectedShippingOption = details.shippingOptions[1];
        otherShippingOption = details.shippingOptions[0];
        details.total.amount.value = '67.00';
    } else {
        reject('Unknown shipping option \'' + shippingOption + '\'');
        return;
    }
    selectedShippingOption.selected = true;
    otherShippingOption.selected = false;
    details.displayItems.splice(2, 1, selectedShippingOption);
    resolve(details);
}

function onBuyClicked(request) {
    request.show().then(function(instrumentResponse) {
        sendPaymentToServer(instrumentResponse);
    })
        .catch(function(err) {
            request.complete('fail');
        });
}

function sendPaymentToServer(instrumentResponse) {
    window.setTimeout(function() {
        instrumentResponse.complete('success')
            .then(function() {
                document.getElementById('result').innerHTML =
                    instrumentToJsonString(instrumentResponse);
            })
            .catch(function(err) {
                instrumentResponse.complete('fail');
            });
    }, 2000);
}

/**
 * Converts the payment instrument into a JSON string.
 *
 * @private
 * @param {PaymentResponse} instrument The instrument to convert.
 * @return {string} The JSON string representation of the instrument.
 */
function instrumentToJsonString(instrument) {
    let details = instrument.details;
    details.cardNumber = 'XXXX-XXXX-XXXX-' + details.cardNumber.substr(12);
    details.cardSecurityCode = '***';

    return JSON.stringify({
        methodName: instrument.methodName,
        details: details
    }, undefined, 2);
}

const payButton = document.getElementById('buyButton');
payButton.setAttribute('style', 'display: none;');
const payButtonWithOptions = document.getElementById('buyButtonWithOptions');
payButtonWithOptions.setAttribute('style', 'display: none;');
const payButtonWithShipping = document.getElementById('buyButtonWithShipping');
payButtonWithShipping.setAttribute('style', 'display: none;');

if (window.PaymentRequest) {
    let request = initPaymentRequest();
    payButton.setAttribute('style', 'display: block;');
    payButton.addEventListener('click', function() {
        onBuyClicked(request);
        request = initPaymentRequest();
    });
    let requestWithOptions = initPaymentRequestWithOptions();
    payButtonWithOptions.setAttribute('style', 'display: block;');
    payButtonWithOptions.addEventListener('click', function() {
        onBuyClicked(requestWithOptions);
        requestWithOptions = initPaymentRequestWithOptions();
    });
    let requestWithShipping = initPaymentRequestWithShipping();
    payButtonWithShipping.setAttribute('style', 'display: block;');
    payButtonWithShipping.addEventListener('click', function() {
        onBuyClicked(requestWithShipping);
        requestWithShipping = initPaymentRequestWithShipping();
    });
} else {
    document.getElementById('result').innerHTML = 'This browser does not support web payments';
}