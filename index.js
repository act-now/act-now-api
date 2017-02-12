exports.handler = function (event, context, callback) {
    var response = undefined;

    functions[event.operation](event).then(function (response) {
            callback(null, response);
        }
        , function (err) {
            callback(err, null);
        });
};


const Sequelize = require('sequelize');
const sequelize = new Sequelize('actnow', process.env['SQL_USER'], process.env['SQL_PASS'],
    {
        host: 'actnow.cxz09bhx6zyk.us-west-1.rds.amazonaws.com',
        dialect: 'mysql'
    });

var Location = sequelize.define('location', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING
    }

});

var User = sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: {
            type: Sequelize.STRING
        },
        lastName: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        }
    }
);

var Demonstration = sequelize.define('demonstration', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING
        },
        date: {
            type: Sequelize.INTEGER
        },
        description: {
            type: Sequelize.TEXT
        }
    }
);

var Organizer = sequelize.define('organizer', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
});

User.belongsTo(Location);
Demonstration.belongsTo(Location);
Organizer.belongsTo(User);
Organizer.belongsTo(Demonstration);
User.belongsToMany(Demonstration, {through: 'UserDemonstration'});


var createUser = function (event) {
    return new Promise(function (resolve, reject) {
        User.create({
            firstName: event.body.firstname,
            lastName: event.body.lastname,
            phone: event.body.phone,
            locationId: event.body.location
        }).then(function (user) {
                response = {
                    id: user.id,
                    firstname: user.firstName,
                    lastname: user.lastName,
                    phone: user.phone,
                    location: user.locationId
                };
                resolve(response);
            }, function (err) {
                reject(err);
            }
        )
    });
};


var getUsers = function (event) {
    return new Promise(function (resolve, reject) {

        User.findAll({
            limit: event.size
        }).then(function (users) {
            response = [];
            users.forEach(function (user) {
                response.push({
                    id: user.id,
                    firstname: user.firstName,
                    lastname: user.lastName,
                    phone: user.phone,
                    location: user.locationId
                })
            });
            resolve(response);
        }, function (err) {
            reject(err);
            ;
        })
    })
};


var getUserById = function (event) {
    return new Promise(function (resolve, reject) {

        User.findByPrimary(event.id).then(function (user) {
            user.getDemonstrations().then(function (demonstrations) {
                following = [];
                demonstrations.forEach(function (demonstration) {
                    following.push(demonstration.id);
                });
                response = [];
                response.push({
                    id: user.id,
                    firstname: user.firstName,
                    lastname: user.lastName,
                    phone: user.phone,
                    location: user.locationId,
                    following: following
                });

            }, function (err) {
                reject(err);

            });

            resolve(response);
        }, function (err) {
            reject(err);
        })
        ;
    })
};

var createDemonstration = function (event) {
    return new Promise(function (resolve, reject) {

        Demonstration.create({
            name: event.body.name,
            date: event.body.date,
            description: event.body.description
        }).then(function (demonstration) {
            response = {
                id: demonstration.id,
                name: demonstration.name,
                date: demonstration.date,
                description: demonstration.description
            };
            resolve(response);
        }, function (err) {
            reject(err);
        });
    })
};

var getDemonstrationById = function (event) {
    return new Promise(function (resolve, reject) {

        Demonstration.findByPrimary(event.id).then(function (demonstration) {
            response = [];
            response.push({
                id: demonstration.id,
                name: demonstration.name,
                date: demonstration.date,
                description: demonstration.description,
                location: demonstration.locationId
            });
            resolve(response);
        }, function (err) {
            reject(err);
        })
        ;
    })
};

var getDemonstrations = function (event) {
    return new Promise(function (resolve, reject) {

        Demonstration.findAll({
            limit: event.size
        }).then(function (demonstrations) {
            response = [];
            demonstrations.forEach(function (demonstration) {
                response.push({
                    id: demonstration.id,
                    name: demonstration.name,
                    date: demonstration.date,
                    description: demonstration.description,
                    location: demonstration.locationId
                })
            });
            resolve(response);
        }, function (err) {
            reject(err);
        })
    })
};

var getDemonstrationsByLocation = function (event) {
    return new Promise(function (resolve, reject) {
        Demonstration.findAll({
            where: {
                locationId: event.body.location
            }
        }).then(function (demonstrations) {
            response = [];
            demonstrations.forEach(function (demonstration) {
                response.push({
                    id: demonstration.id,
                    name: demonstration.name,
                    date: demonstration.date,
                    description: demonstration.description,
                    location: demonstration.locationId
                })
            });
            resolve(response);
        }, function (err) {
            reject(err);
        });
    })
};


var getLocations = function (event) {
    return new Promise(function (resolve, reject) {

        Location.findAll().then(function (locations) {
            response = [];
            locations.forEach(function (location) {
                response.push({
                    id: location.id,
                    name: location.name
                })
            });
            resolve(response);
        }, function (err) {
            reject(err);
        })
    })
};

var followDemonstration = function (event) {
    return new Promise(function (resolve, reject) {
        User.findByPrimary(event.body.user).then(function (user) {
            user.addDemonstration(event.id).then(function () {
                response = {
                    id: event.id,
                    user: event.body.user
                };
                resolve(response);
            }, function (err) {
                reject(err);
            })

        }, function (err) {
            reject(err);
        });
    })
};


functions = {
    createUser: createUser,
    getUsers: getUsers,
    getUserById: getUserById,
    createDemonstration: createDemonstration,
    getDemonstrationById: getDemonstrationById,
    getDemonstrations: getDemonstrations,
    getDemonstrationsByLocation: getDemonstrationsByLocation,
    getLocations: getLocations,
    followDemonstration: followDemonstration
};

