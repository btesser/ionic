const webPush = require('web-push');

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log("You must set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
        "environment variables. You can use the following ones:");
    console.log(webPush.generateVAPIDKeys());
    return;
}
webPush.setVapidDetails(
    'https://serviceworke.rs/',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

module.exports = function (app, route) {
    const subscriptions = {};

    function sendNotification(subscription) {
        webPush.sendNotification(subscription)
        .then(function() {
          console.log('Push Application Server - Notification sent to ' + subscription.endpoint);
        }).catch(function() {
          console.log('ERROR in sending Notification, endpoint removed ' + subscription.endpoint);
        //   delete subscriptions[subscription.endpoint];
        });
      }
    app.get(route + 'vapidPublicKey', function (req, res) {
        res.send(process.env.VAPID_PUBLIC_KEY);
    });

    app.post(route + 'register/:studentId', function(req, res) {
        var subscription = req.body.subscription;
        if (!subscriptions[req.params.studentId]) {
          console.log('Subscription registered ' + subscription.endpoint);
          subscriptions[req.params.studentId] = subscription;
        }
        res.type('js').send('{"success":true}');
      });
      app.post(route + 'unregister/:studentId', function(req, res) {
        var subscription = req.body.subscription;
        if (subscriptions[req.params.studentId]) {
          console.log('Subscription unregistered ' + subscription.endpoint);
          delete subscriptions[req.params.studentId];
        }
        res.type('js').send('{"success":true}');
      });
    app.post(route + 'sendNotification', function (req, res) {
        const { studentIds } = req.body;
        const payload = null;
        const options = {
            TTL: req.body.ttl
        };
        const matchingSubscriptions = studentIds.map(studentId => subscriptions[studentId]);

        setTimeout(function () {
            matchingSubscriptions.forEach((subscription) => {
                webPush.sendNotification(subscription, payload, options)
                .then(function () {
                    res.status(201).send('{event: "newAssignment"}');
                })
                .catch(function (error) {
                    res.sendStatus(500);
                    console.log(error);
                });
            });
        }, req.body.delay * 1000);
    });
};