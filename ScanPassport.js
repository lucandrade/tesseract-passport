import Tesseract from 'tesseract.js';
import Promise from 'bluebird';
import fs from 'fs';
import Canvas, { Image } from 'canvas';
import Request from 'request';

export default class ScanPassport {
    constructor() {
        this.image = null;
        this.config = {
            surname: [-230, -95, 470, 25],
            given: [-230, -150, 470, 25],
            nationality: [-230, -185, 270, 25],
            birthDate: [-500, -185, 210, 25],
            genre: [-230, -220, 80, 20],
            birthPlace: [-340, -220, 370, 20],
            issueDate: [-230, -256, 170, 20],
            expirationDate: [-500, -256, 210, 20],
            authority: [-50, -298, 210, 20],
            type: [-230, -37, 60, 20],
            countryCode: [-340, -37, 60, 20],
            number: [-500, -37, 200, 22],
        }

        const parseDate = date => {
            if (date.indexOf('.') >= 0) {
                const dateParts = date.split('.');

                if (dateParts.length == 3) {
                    const [day, month, year] = dateParts;
                    return new Date(year, parseInt(month-1), day);
                }
            }

            return '';
        }

        this.parsers = {
            birthDate: parseDate,
            issueDate: parseDate,
            expirationDate: parseDate,
            genre: genre => {
                if (genre) {
                    const data = genre.toLowerCase(genre);
                    switch (data) {
                        case 'f':
                            return 'female';
                        case 'm':
                            return 'male';
                        default:
                            return '';
                    }
                }

                return '';
            }
        };
    }

    load(url) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            Request.get(url)
                .on('error', () => {
                    reject('image not found');
                })
                .on('response', function(response) {
                    if (
                        response.statusCode !== 200 ||
                        !/image/.test(response.headers['content-type'])
                    ) {
                        reject('image not found');
                    }
                })
                .on('data', chunk => chunks.push(chunk))
                .on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const image = new Image();
                    image.src = buffer;
                    resolve(image);
                });
        });
    }

    scan(url) {
        const me = this;
        const data = {};
        return new Promise((resolve, reject) => {
            me.load(url)
                .then(image => {
                    me.image = image;
                    const fields = Object.keys(me.config).map(field => {
                        return me.process(field)
                            .then(res => {
                                data[field] = me.parse(res.text, field);
                            }).catch(err => {
                                throw `Error parsing ${field}`;
                            });
                    });

                    const result = Promise.all(fields)
                        .then(res => resolve(data))
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    parse(text, field) {
        if (text) {
            const parsed = text.replace(/(\r\n|\n|\r)/gm,"");

            if (this.parsers.hasOwnProperty(field)) {
                return this.parsers[field](parsed);
            }

            return parsed;
        }

        return '';
    }

    process(field) {
        const config = this.config[field];
        const [x, y, w, h] = config;
        const data = this.extract(x, y, w, h);
        return Tesseract.recognize(data);
    }

    extract(x, y, w, h) {
        const me = this;
        const canvas = new Canvas(w, h);
        const context = canvas.getContext('2d');
        context.drawImage(me.image, x, y);
        return canvas.toBuffer();
    }
}
