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
                label: 'Shipping',
                amount: {currency: 'USD', value: '0.00'},
                pending: true,
            },
            {
                label: 'Friends and family discount',
                amount: {currency: 'USD', value: '-10.00'},
            },
        ],
    };

    let options = {requestShipping: true};

    let request = new PaymentRequest(supportedInstruments, details, options);

    request.addEventListener('shippingaddresschange', function(evt) {
        evt.updateWith(new Promise(function(resolve) {
            updateDetails(details, request.shippingAddress, resolve);
        }));
    });

    return request;
}

function updateDetails(details, shippingAddress, callback) {
    let shippingOption = {
        id: '',
        label: '',
        amount: {currency: 'USD', value: '0.00'},
        selected: true,
        pending: false,
    };
    if (shippingAddress.country === 'US') {
        if (shippingAddress.region === 'CA') {
            shippingOption.id = 'californiaFreeShipping';
            shippingOption.label = 'Free shipping in California';
            details.total.amount.value = '55.00';
        } else {
            shippingOption.id = 'unitedStatesStandardShipping';
            shippingOption.label = 'Standard shipping in US';
            shippingOption.amount.value = '5.00';
            details.total.amount.value = '60.00';
        }
        details.shippingOptions = [shippingOption];
        delete details.error;
    } else {
        // Don't ship outside of US for the purposes of this example.
        shippingOption.label = 'Shipping';
        shippingOption.pending = true;
        details.total.amount.value = '55.00';
        details.error = 'Cannot ship outside of US.';
        delete details.shippingOptions;
    }
    details.displayItems.splice(1, 1, shippingOption);
    callback(details);
}

function addressToDictionary(address) {
    if (address.toJSON) {
        return address.toJSON();
    }

    return {
        recipient: address.recipient,
        organization: address.organization,
        addressLine: address.addressLine,
        dependentLocality: address.dependentLocality,
        city: address.city,
        region: address.region,
        postalCode: address.postalCode,
        sortingCode: address.sortingCode,
        country: address.country,
        languageCode: address.languageCode,
        phone: address.phone,
    };
}

function onBuyClicked(request) {
    request.show().then(function(instrumentResponse) {
        sendPaymentToServer(instrumentResponse);
    })
        .catch(function(err) {
            ChromeSamples.setStatus(err);
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
                ChromeSamples.setStatus(err);
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
    payButton.setAttribute('style', 'display: inline;');
    payButton.addEventListener('click', function() {
        onBuyClicked(request);
        request = initPaymentRequest();
    });
    let requestWithOptions = initPaymentRequestWithOptions();
    payButtonWithOptions.setAttribute('style', 'display: inline;');
    payButtonWithOptions.addEventListener('click', function() {
        onBuyClicked(requestWithOptions);
        requestWithOptions = initPaymentRequestWithOptions();
    });
    let requestWithShipping = initPaymentRequestWithShipping();
    payButtonWithShipping.setAttribute('style', 'display: inline;');
    payButtonWithShipping.addEventListener('click', function() {
        onBuyClicked(requestWithOptions);
        requestWithShipping = initPaymentRequestWithShipping();
    });
} else {
    document.getElementById('result').innerHTML = 'This browser does not support web payments';
}