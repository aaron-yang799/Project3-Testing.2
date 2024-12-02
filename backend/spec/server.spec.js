const request = require('supertest'); // super test makes testing requests easier, lets you simulate requests
const app = require('../server');
const { response } = require('express');


//Starts a server on port 3000 everytime testing is run, make sure that nothing is running there
describe('Calculator API: ', () => {
    describe('POST /api/calculate', () => {
        it('should return a result of two numbers added together', (done) => {
            const expression = { num1: 1, num2: 2, operation: 'add' };

            //simulates the post request to the server
            request(app)
                .post('/api/calculate')
                .send(expression)
                .expect(200)
                .expect((res) => {
                    expect(res.body.result).toBe(3);
                })
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });

        it('should return a result of two numbers subtracted', (done) => {
            const expression = { num1: 1, num2: 2, operation: 'subtract' };

            //simulates the post request to the server
            request(app)
                .post('/api/calculate')
                .send(expression)
                .expect(200)
                .expect((res) => {
                    expect(res.body.result).toBe(-1);
                })
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });

        it('should return a result of two numbers multiplied', (done) => {
            const expression = { num1: 2, num2: 3, operation: 'multiply' };

            //simulates the post request to the server
            request(app)
                .post('/api/calculate')
                .send(expression)
                .expect(200)
                .expect((res) => {
                    expect(res.body.result).toBe(6);
                })
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });

        it('should return a result of two numbers divided', (done) => {
            const expression = { num1: 10, num2: 2, operation: 'divide' };
            
            //simulates the post request to the server
            request(app)
                .post('/api/calculate')
                .send(expression)
                .expect(200)
                .expect((res) => {
                    expect(res.body.result).toBe(5);
                })
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });

        it('should return an error if the operation is invalid', (done) => {
            const expression = { num1: 1, num2: 2, operation: 'invalid' };

            //simulates the post request to the server
            request(app)
                .post('/api/calculate')
                .send(expression)
                .expect(400)
                .expect((res) => {
                    expect(res.body.error).toBe('Invalid operation');
                })
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });

        it('should return an error if dividing by zero', (done) => {
            const expression = { num1: 1, num2: 0, operation: 'divide' };

            //simulates the post request to the server
            request(app)
                .post('/api/calculate')
                .send(expression)
                .expect(400)
                .expect((res) => {
                    expect(res.body.error).toBe('Cannot divide by zero');
                })
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });

        it('should return a negative if a negative number is multiplied by a positive number', (done) => {
            const expression = { num1: -2, num2: 3, operation: 'multiply' };

            //simulates the post request to the server
            request(app)
                .post('/api/calculate')
                .send(expression)
                .expect(200)
                .expect((res) => {
                    expect(res.body.result).toBe(-6);
                })
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });
    });

    describe('Error handling', () => {
        it('should return an error if the numbers are invalid', (done) => {
            const expression = { num1: 'a', num2: 2, operation: 'add' };

            //simulates the post request to the server
            request(app)
                .post('/api/calculate')
                .send(expression)
                .expect(400)
                .expect((res) => {
                    expect(res.body.error).toBe('Invalid numbers provided');
                })
                .end((err, res) => {
                    if (err) return done(err);
                    done();
                });
        });
    });
});