const Joi = require('joi');
const _ = require('lodash');
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const nodemailer = require('nodemailer');

module.exports = function(db, configuration) {

    let hostname = configuration.app.public_hostname;
    let getPublicUrl = path => `${hostname}${path}`;
    let getRegionEmail = region => region.contact ? `${region.contact}@pole-emploi.fr` : configuration.smtp.from;
    let transporter = nodemailer.createTransport({
        name: configuration.smtp.hostname,
        host: configuration.smtp.host,
        port: configuration.smtp.port,
        secure: configuration.smtp.secure,
        greetingTimeout: configuration.smtp.greetingTimeout,
        tls: {
            rejectUnauthorized: false
        },
        ...(!configuration.smtp.user ? {} : {
            auth: {
                user: configuration.smtp.user,
                pass: configuration.smtp.password
            }
        })
    });
    transporter.use('compile', htmlToText({ ignoreImage: true }));


    return {
        createRegionalMailer: region => {
            return {
                sendEmail: async (emailAddress, message, options = {}) => {

                    let { subject, body } = await Joi.validate(message, {
                        subject: Joi.string().required(),
                        body: Joi.string().required(),
                    }, { abortEarly: false });

                    return transporter.sendMail(_.merge({}, {
                        to: emailAddress,
                        subject,
                        from: `Anotea <${configuration.smtp.from}>`,
                        replyTo: `Anotea <${getRegionEmail(region)}>`,
                        list: {
                            help: getPublicUrl('/faq'),
                        },
                        html: body,
                    }, {
                        ...options,
                        bcc: process.env.ANOTEA_MAIL_BCC ? { bcc: process.env.ANOTEA_MAIL_BCC } : {},
                    }));
                }
            };
        }
    };
};
