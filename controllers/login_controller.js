var db = require('./../helpers/db_helpers')
var helper = require('./../helpers/helpers')
const nodemailer = require('nodemailer'); // Add this at the top of your file

module.exports.controller = (app, io, socket_list) => {

    const msg_success = "successfully";
    const ordermsg_success = "Order placed Successfully";
    const msg_fail = "fail";
    const msg_invalidUser = "invalid username and password";
    const msg_already_register = "This email already register ";
    const msg_add_address = "Address added successfully"
    const msg_update_address = "Address updated successfully"
    const msg_remove_address = "Address removed successfully"

    // ------------------------------------------category_list list--------------------------------------------------------------------

    app.post('/api/app/explore_category_list', (req, res) => {
        helper.Dlog(req.body)
        checkAccessToken(req.headers, res, (userObj) => {
            db.query("SELECT `cat_id`, `cat_name`, `image` , `color` FROM `category_detail` WHERE `status` = 1 ", [], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }
                res.json({
                    "status": "1",
                    "payload": result,
                    "message": msg_success
                })
            })
        }, '1')
    })

    // ------------------------------------------Product  list--------------------------------------------------------------------
    app.get('/api/app/all_product_list', (req, res) => {
        helper.Dlog(req.body)
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            db.query("SELECT * FROM `product_detail` ", [], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }
                res.json({
                    "status": "1",
                    "payload": result,
                    "message": msg_success
                });
            });
        }, '1')
    });
    // ------------------------------------------product list---------------------------------------------------------------------------

    app.post('/api/app/explore_category_items_list', (req, res) => {
        helper.Dlog(req.body)
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(res, reqObj, ["cat_id"], () => {
                db.query("SELECT `pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`,  `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`nutrition_weight`, `pd`.`price`, `pd`.`created_date`, `pd`.`modify_date`, `cd`.`cat_name` FROM  `product_detail` AS `pd` " +
                    "INNER JOIN `category_detail` AS `cd` ON `pd`.`cat_id` = `cd`.`cat_id` AND `pd`.`status` = 1 " +
                    " WHERE `cd`.`cat_id` = ? AND `cd`.`status` = '1' GROUP BY `pd`.`prod_id`  ", [reqObj.cat_id], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        res.json({
                            "status": "1",
                            "payload": result,
                            "message": msg_success
                        })

                    })
            })
        }, '1')
    })

    app.post('/api/app/product_detail', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (uObj) => {
            helper.CheckParameterValid(res, reqObj, ["prod_id"], () => {
                db.query('SELECT * FROM product_detail WHERE prod_id=?', [reqObj.prod_id], (err, results) => {
                    if (!err) {
                        res.send(results[0]);
                    } else {
                        console.log(err)
                    }
                });
            })
        }, "1")

    })

    app.post('/api/app/product_search', (req, res, err) => {
        search = req.body.search
        db.query("SELECT * FROM product_detail WHERE name LIKE ?", search, (err, rows) => {

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

        })
    })

    // ------------------------------------------address-------------------------------------------------------------------------------

    app.post('/api/app/add_delivery_address', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(
                res,
                reqObj,
                ["roadno", "type_name", "phone", "address", "city", "state", "postal_code", "latitude", "longitude", "current_location"],
                () => {
                    db.query(
                        "INSERT INTO `address_detail`(`user_id`, `roadno`, `phone`, `address`, `city`, `state`, `type_name`, `postal_code`, `latitude`, `longitude`, `current_location`) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                        [
                            userObj.user_id,
                            reqObj.roadno,
                            reqObj.phone,
                            reqObj.address,
                            reqObj.city,
                            reqObj.state,
                            reqObj.type_name,
                            reqObj.postal_code,
                            reqObj.latitude,
                            reqObj.longitude,
                            reqObj.current_location
                        ],
                        (err, result) => {
                            if (err) {
                                helper.ThrowHtmlError(err, res);
                                return;
                            }

                            if (result) {
                                res.json({
                                    "status": "1",
                                    "message": msg_add_address
                                });
                            } else {
                                res.json({
                                    "status": "0",
                                    "message": msg_fail
                                });
                            }
                        }
                    );
                }
            );
        });
    });
    app.post('/api/app/update_delivery_address', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(
                res,
                reqObj,
                ["address_id", "roadno", "type_name", "phone", "address", "city", "state", "postal_code", "latitude", "longitude", "current_location"],
                () => {
                    db.query(
                        "UPDATE `address_detail` SET `roadno`=?, `phone`=?, `address`=?, `city`=?, `state`=?, `type_name`=?, `postal_code`=?, `latitude`=?, `longitude`=?, `current_location`=?, `modify_date`=NOW() WHERE `address_id`=? AND `status`=1",
                        [
                            reqObj.roadno,
                            reqObj.phone,
                            reqObj.address,
                            reqObj.city,
                            reqObj.state,
                            reqObj.type_name,
                            reqObj.postal_code,
                            reqObj.latitude,
                            reqObj.longitude,
                            reqObj.current_location,
                            reqObj.address_id
                        ],
                        (err, result) => {
                            if (err) {
                                helper.ThrowHtmlError(err, res);
                                return;
                            }
                            if (result.affectedRows > 0) {
                                res.json({
                                    "status": "1",
                                    "message": msg_update_address
                                });
                            } else {
                                res.json({
                                    "status": "0",
                                    "message": msg_fail
                                });
                            }
                        }
                    );
                }
            );
        });
    });

    app.post('/api/app/delete_delivery_address', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(res, reqObj, ["address_id"], () => {
                db.query('DELETE FROM address_detail WHERE address_id=?', [reqObj.address_id], (err, result) => {
                    if (err) {
                        helper.ThrowHtmlError(err, res);
                        return
                    }

                    if (result.affectedRows > 0) {
                        res.json({
                            "status": "1",
                            "message": msg_remove_address
                        })
                    } else {
                        res.json({
                            "status": "0",
                            "message": msg_fail
                        })
                    }
                })
            })
        })
    })

    app.post('/api/app/mark_default_delivery_address', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(res, reqObj, ["address_id"], () => {
                db.query("UPDATE `address_detail` SET `is_default` = (CASE WHEN `address_id` = ? THEN 1 ELSE 0 END) , `modify_date`= NOW() WHERE `user_id` = ? AND `status` = 1 ", [reqObj.address_id, userObj.user_id], (err, result) => {
                    if (err) {
                        helper.ThrowHtmlError(err, res);
                        return
                    }

                    if (result.affectedRows > 0) {
                        res.json({
                            "status": "1",
                            "message": msg_success
                        })
                    } else {
                        res.json({
                            "status": "0",
                            "message": msg_fail
                        })
                    }
                })
            })
        })
    })

    app.get('/api/app/delivery_address', (req, res) => {
        helper.Dlog(req.body);
        checkAccessToken(req.headers, res, (userObj) => {
            db.query(
                `SELECT ad.*, ud.name AS user_name, ud.mobile AS user_mobile
             FROM address_detail ad
             JOIN user_detail ud ON ad.user_id = ud.user_id
             WHERE ad.user_id = ? AND ad.status = 1`,
                [userObj.user_id],
                (err, result) => {
                    if (err) {
                        helper.ThrowHtmlError(err, res);
                        return;
                    }
                    res.json({
                        "status": 1,
                        "payload": result,
                        "message": msg_success
                    });
                }
            );
        });
    });
    // ------------------------------------------order-------------------------------------------------------------------------------

    app.post('/api/app/userAddorder', (req, res) => {
        var responseJson = JSON.stringify(req.body);
        checkAccessToken(req.headers, res, (userObj) => {
            var data = {
                "address_id": req.body.address_id,
                "user_id": userObj.user_id,
                "invoic": req.body.invoic,
                "product_details": responseJson,
                "discount_amt": req.body.discount_amt,
                "total_amt": req.body.total_amt,
                "delivery_amt": req.body.delivery_amt,
                "subtoal": req.body.subtoal,
                "order_status": req.body.order_status,
                "tax": req.body.tax,
                "payment_type": req.body.payment_type,
                "rider_id": req.body.rider_id || 0,
            }
            db.query('INSERT INTO  user_order SET ?', data, function (err, result) {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }
                res.json({
                    status: 1,
                    "payload": result,
                    "message": ordermsg_success
                })
                var orders = [];
                io.to('user_' + userObj.user_id).emit('order_update', {
                    message: 'Order placed',
                    order: result
                });
                const order = { id: Date.now(), ...req.body };
                orders.push(order);
                io.emit('new_order', order);
            });

            app.post('/api/app/userOrderlist', (req, res) => {
                var reqObj = req.body;
                checkAccessToken(req.headers, res, (userObj) => {
                    db.query('SELECT * FROM  user_order WHERE user_id = ' + userObj.user_id + ' ORDER BY created_date DESC', (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }
                        res.json({
                            status: 1,
                            "payload": result,
                            "message": msg_success
                        })
                        // io.to('user_' + userObj.user_id).emit('order_update', { message: 'Order placed', order: result });
                    })
                })
            })

            app.post('/api/app/userLastOrderlist', (req, res) => {
                var reqObj = req.body;
                checkAccessToken(req.headers, res, (userObj) => {
                    db.query('SELECT * FROM  user_order WHERE user_id = ' + userObj.user_id + ' AND order_status = 1 OR order_status = 2 OR order_status = 3  ORDER BY orders_id DESC  LIMIT 1', (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }
                        res.json({
                            status: 1,
                            "payload": result,
                            "message": msg_success
                        })
                    })
                })
            })

            app.post('/api/app/userOrderlistDetialsById', (req, res) => {
                var reqObj = req.body;
                checkAccessToken(req.headers, res, (userObj) => {
                    db.query("SELECT * FROM `user_order` AS `od` " +
                        "INNER JOIN `address_detail` AS `ad` ON  `od`.`user_id` = `ad`.`user_id` " +
                        "INNER JOIN `user_detail` AS `user` ON  `user`.`user_id` = `od`.`user_id` " +
                        "LEFT JOIN `rider` AS `odt` ON `odt`.`rider_id` = `od`.`rider_id` " +
                        "WHERE `od`.`orders_id` = ? GROUP BY `od`.`orders_id` ", [reqObj.orderid], (err, result) => {
                            console.log(result)
                            if (err) throw err;
                            else {
                                res.json({ status: "1", payload: result[0], "message": msg_success })
                            }
                        })
                })
            })

            /////////////////////////////////User passward reset login ///////////////////////////////////////

            app.post('/api/app/login', (req, res) => {
                helper.Dlog(req.body);
                var reqObj = req.body;

                helper.CheckParameterValid(res, reqObj, ["email", "password"], () => {
                    var auth_token = helper.createRequestToken();
                    db.query("UPDATE `user_detail` SET `auth_token`= ?,`modify_date`= NOW() WHERE `user_type` = ? AND `email` = ? AND `password` = ? AND `status` = ?", [auth_token, "1", reqObj.email, reqObj.password, "1"], (err, result) => {

                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if (result.affectedRows > 0) {


                            db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`,`auth_token`, `status`, `created_date` FROM `user_detail` WHERE `email` = ? AND `password` = ? AND `status` = "1" ', [reqObj.email, reqObj.password], (err, result) => {

                                if (err) {
                                    helper.ThrowHtmlError(err, res);
                                    return
                                }

                                if (result.length > 0) {
                                    res.json({ "status": "1", "payload": result[0], "message": msg_success })
                                } else {
                                    res.json({ "status": "0", "message": msg_invalidUser })
                                }
                            })
                        } else {
                            res.json({ "status": "0", "message": msg_invalidUser })
                        }

                    })
                })
            })

            app.post('/api/app/sign_up', (req, res) => {
                helper.Dlog(req.body);
                var reqObj = req.body;

                helper.CheckParameterValid(res, reqObj, ["username", "email", "password", "mobile"], () => {

                    db.query('SELECT `user_id`, `status` FROM `user_detail` WHERE `email` = ? ', [reqObj.email], (err, result) => {

                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if (result.length > 0) {
                            res.json({ "status": "1", "payload": result[0], "message": msg_already_register })
                        } else {

                            var auth_token = helper.createRequestToken();
                            db.query("INSERT INTO `user_detail`( `username`, `email`, `password`,`mobile` ,`auth_token`, `created_date`, `modify_date`) VALUES (?,?, ?,?,?, NOW(), NOW())", [reqObj.username, reqObj.email, reqObj.password, reqObj.mobile, auth_token], (err, result) => {
                                if (err) {
                                    helper.ThrowHtmlError(err, res);
                                    return
                                }

                                if (result) {
                                    db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date`  FROM `user_detail` WHERE `user_id` = ? AND `status` = "1" ', [result.insertId], (err, result) => {

                                        if (err) {
                                            helper.ThrowHtmlError(err, res);
                                            return
                                        }

                                        if (result.length > 0) {
                                            res.json({ "status": "1", "payload": result[0], "message": msg_success })
                                        } else {
                                            res.json({ "status": "0", "message": msg_invalidUser })
                                        }
                                    })
                                } else {
                                    res.json({ "status": "0", "message": msg_fail })
                                }
                            })

                        }
                    })
                })
            })

            app.post('/api/app/userprofile', (req, res) => {
                helper.Dlog(req.body)
                checkAccessToken(req.headers, res, (userObj) => {
                    db.query('SELECT * FROM user_detail WHERE user_id =?', [userObj.user_id], (err, result) => {
                        console.log(result)
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }
                        res.json({
                            "status": "1",
                            "payload": result,
                            "message": msg_success
                        })

                    })
                }, '1')
            })

            app.post('/api/app/update_profile', (req, res) => {
                helper.Dlog(req.body);
                var reqObj = req.body
                checkAccessToken(req.headers, res, (userObj) => {
                    helper.CheckParameterValid(res, reqObj, ["username", "name", "mobile", "mobile_code", 'email'], () => {
                        db.query("UPDATE `user_detail` SET `username`=?,`name`=?,`mobile`=?,`mobile_code`=?, `email`=?, `modify_date`=NOW() WHERE `user_id` = ? AND `status` = 1", [reqObj.username, reqObj.name, reqObj.mobile, reqObj.mobile_code, reqObj.email, userObj.user_id], (err, result) => {
                            if (err) {
                                helper.ThrowHtmlError(err, res)
                                return
                            }

                            if (result.affectedRows > 0) {
                                db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `user_id` = ? AND `status` = "1" ', [userObj.user_id], (err, result) => {

                                    if (err) {
                                        helper.ThrowHtmlError(err, res);
                                        return
                                    }

                                    if (result.length > 0) {
                                        res.json({ "status": "1", "payload": result[0], "message": msg_success })
                                    } else {
                                        res.json({ "status": "0", "message": msg_invalidUser })
                                    }
                                })
                            } else {
                                res.json({
                                    "status": "0",
                                    "message": msg_fail
                                })
                            }
                        })
                    })

                })
            })

            app.post('/api/app/change_password', (req, res) => {
                helper.Dlog(req.body);
                var reqObj = req.body
                checkAccessToken(req.headers, res, (userObj) => {
                    helper.CheckParameterValid(res, reqObj, ["current_password", "new_password"], () => {
                        db.query("UPDATE `user_detail` SET `password`=?, `modify_date`=NOW() WHERE `user_id` = ? AND `password` = ?", [reqObj.new_password, userObj.user_id, reqObj.current_password], (err, result) => {
                            if (err) {
                                helper.ThrowHtmlError(err, res)
                                return
                            }

                            if (result.affectedRows > 0) {
                                res.json({ "status": "1", "message": msg_success })
                            } else {
                                res.json({
                                    "status": "0",
                                    "message": msg_fail
                                })
                            }
                        })
                    })

                }, "1")
            })

            app.post('/api/app/forgot_password_request', (req, res) => {
                helper.Dlog(req.body);
                var reqObj = req.body

                helper.CheckParameterValid(res, reqObj, ["email"], () => {
                    db.query("SELECT `user_id` FROM `user_detail` WHERE `email` = ? ", [reqObj.email], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res)
                            return
                        }

                        if (result.length > 0) {
                            var reset_code = helper.createNumber()
                            db.query("UPDATE `user_detail` SET `reset_code` = ? WHERE `user_id` = ? ", [reset_code, result[0].user_id], (err, uResult) => {
                                if (err) {
                                    helper.ThrowHtmlError(err, res)
                                    return
                                }

                                if (uResult.affectedRows > 0) {
                                    // Send reset code email
                                    let transporter = nodemailer.createTransport({
                                        service: 'gmail', // or your email provider
                                        auth: {
                                            user: 'masalamagickhurai@gmail.com', // replace with your email
                                            pass: 'xnrpvnjnqqywyrqx'    // replace with your email password or app password
                                        }
                                    });

                                    let mailOptions = {
                                        from: 'masalamagickhurai@gmail.com',
                                        to: reqObj.email,
                                        subject: 'Password Reset Code',
                                        text: `Your password reset code is: ${reset_code}`
                                    };

                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            console.log(error);
                                            res.json({ "status": "0", "message": "Failed to send email" });
                                        } else {
                                            res.json({ "status": "1", "message": msg_success });
                                        }
                                    });
                                } else {
                                    res.json({
                                        "status": "0",
                                        "message": msg_fail
                                    })
                                }
                            })

                        } else {
                            res.json({
                                "status": "0",
                                "message": "user not exits"
                            })
                        }
                    })
                })
            })

            app.post('/api/app/forgot_password_verify', (req, res) => {
                helper.Dlog(req.body);
                var reqObj = req.body

                helper.CheckParameterValid(res, reqObj, ["email", "reset_code"], () => {
                    db.query("SELECT `user_id` FROM `user_detail` WHERE `email` = ? AND `reset_code` ", [reqObj.email, reqObj.reset_code], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res)
                            return
                        }

                        if (result.length > 0) {
                            var reset_code = helper.createNumber()
                            db.query("UPDATE `user_detail` SET `reset_code` = ? WHERE `user_id` = ? ", [reset_code, result[0].user_id], (err, uResult) => {
                                if (err) {
                                    helper.ThrowHtmlError(err, res)
                                    return
                                }


                                if (uResult.affectedRows > 0) {
                                    res.json({ "status": "1", "payload": { "user_id": result[0].user_id, "reset_code": reset_code }, "message": msg_success })
                                } else {
                                    res.json({
                                        "status": "0",
                                        "message": msg_fail
                                    })
                                }
                            })

                        } else {
                            res.json({
                                "status": "0",
                                "message": "user not exits"
                            })
                        }
                    })
                })


            })
            app.post('/api/app/forgot_password_set_password', (req, res) => {
                helper.Dlog(req.body);
                var reqObj = req.body

                helper.CheckParameterValid(res, reqObj, ["user_id", "reset_code", "new_password"], () => {

                    var reset_code = helper.createNumber()
                    db.query("UPDATE `user_detail` SET `password` = ? , `reset_code` = ?  WHERE `user_id` = ? AND `reset_code` = ? ", [reqObj.new_password, reset_code, reqObj.user_id, reqObj.reset_code], (err, uResult) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res)
                            return
                        }


                        if (uResult.affectedRows > 0) {
                            res.json({ "status": "1", "message": "update password successfully" })
                        } else {
                            res.json({
                                "status": "0",
                                "message": msg_fail
                            })
                        }
                    })
                })


            })

        });
    })
    app.post('/api/app/userOrderlist', (req, res) => {
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            db.query('SELECT * FROM  user_order WHERE user_id = ' + userObj.user_id + ' ORDER BY created_date DESC', (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }
                res.json({
                    status: 1,
                    "payload": result,
                    "message": msg_success
                })
            })
        })
    })

    app.post('/api/app/userLastOrderlist', (req, res) => {
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            db.query('SELECT * FROM  user_order WHERE user_id = ' + userObj.user_id + ' AND order_status = 1 OR order_status = 2 OR order_status = 3  ORDER BY orders_id DESC  LIMIT 1', (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }
                res.json({
                    status: 1,
                    "payload": result,
                    "message": msg_success
                })
            })
        })
    })

    app.post('/api/app/userOrderlistDetialsById', (req, res) => {
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (userObj) => {
            db.query("SELECT * FROM `user_order` AS `od` " +
                "INNER JOIN `address_detail` AS `ad` ON  `od`.`user_id` = `ad`.`user_id` " +
                "INNER JOIN `user_detail` AS `user` ON  `user`.`user_id` = `od`.`user_id` " +
                "LEFT JOIN `rider` AS `odt` ON `odt`.`rider_id` = `od`.`rider_id` " +
                "WHERE `od`.`orders_id` = ? GROUP BY `od`.`orders_id` ", [reqObj.orderid], (err, result) => {
                    console.log(result)
                    if (err) throw err;
                    else {
                        res.json({ status: "1", payload: result[0], "message": msg_success })
                    }
                })
        })
    })

    /////////////////////////////////User passward reset login ///////////////////////////////////////

    app.post('/api/app/login', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;

        helper.CheckParameterValid(res, reqObj, ["email", "password"], () => {
            var auth_token = helper.createRequestToken();
            db.query("UPDATE `user_detail` SET `auth_token`= ?,`modify_date`= NOW() WHERE `user_type` = ? AND `email` = ? AND `password` = ? AND `status` = ?", [auth_token, "1", reqObj.email, reqObj.password, "1"], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }

                if (result.affectedRows > 0) {


                    db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`,`auth_token`, `status`, `created_date` FROM `user_detail` WHERE `email` = ? AND `password` = ? AND `status` = "1" ', [reqObj.email, reqObj.password], (err, result) => {

                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if (result.length > 0) {
                            res.json({ "status": "1", "payload": result[0], "message": msg_success })
                        } else {
                            res.json({ "status": "0", "message": msg_invalidUser })
                        }
                    })
                } else {
                    res.json({ "status": "0", "message": msg_invalidUser })
                }

            })
        })
    })

    app.post('/api/app/sign_up', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;

        helper.CheckParameterValid(res, reqObj, ["username", "email", "password", "mobile"], () => {

            db.query('SELECT `user_id`, `status` FROM `user_detail` WHERE `email` = ? ', [reqObj.email], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }

                if (result.length > 0) {
                    res.json({ "status": "1", "payload": result[0], "message": msg_already_register })
                } else {

                    var auth_token = helper.createRequestToken();
                    db.query("INSERT INTO `user_detail`( `username`, `email`, `password`,`mobile` ,`auth_token`, `created_date`, `modify_date`) VALUES (?,?, ?,?,?, NOW(), NOW())", [reqObj.username, reqObj.email, reqObj.password, reqObj.mobile, auth_token], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if (result) {
                            db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date`  FROM `user_detail` WHERE `user_id` = ? AND `status` = "1" ', [result.insertId], (err, result) => {

                                if (err) {
                                    helper.ThrowHtmlError(err, res);
                                    return
                                }

                                if (result.length > 0) {
                                    res.json({ "status": "1", "payload": result[0], "message": msg_success })
                                } else {
                                    res.json({ "status": "0", "message": msg_invalidUser })
                                }
                            })
                        } else {
                            res.json({ "status": "0", "message": msg_fail })
                        }
                    })

                }
            })
        })
    })

    app.post('/api/app/userprofile', (req, res) => {
        helper.Dlog(req.body)
        checkAccessToken(req.headers, res, (userObj) => {
            db.query('SELECT * FROM user_detail WHERE user_id =?', [userObj.user_id], (err, result) => {
                console.log(result)
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }
                res.json({
                    "status": "1",
                    "payload": result,
                    "message": msg_success
                })

            })
        }, '1')
    })

    app.post('/api/app/update_profile', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body
        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(res, reqObj, ["username", "name", "mobile", "mobile_code", 'email'], () => {
                db.query("UPDATE `user_detail` SET `username`=?,`name`=?,`mobile`=?,`mobile_code`=?, `email`=?, `modify_date`=NOW() WHERE `user_id` = ? AND `status` = 1", [reqObj.username, reqObj.name, reqObj.mobile, reqObj.mobile_code, reqObj.email, userObj.user_id], (err, result) => {
                    if (err) {
                        helper.ThrowHtmlError(err, res)
                        return
                    }

                    if (result.affectedRows > 0) {
                        db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `user_id` = ? AND `status` = "1" ', [userObj.user_id], (err, result) => {

                            if (err) {
                                helper.ThrowHtmlError(err, res);
                                return
                            }

                            if (result.length > 0) {
                                res.json({ "status": "1", "payload": result[0], "message": msg_success })
                            } else {
                                res.json({ "status": "0", "message": msg_invalidUser })
                            }
                        })
                    } else {
                        res.json({
                            "status": "0",
                            "message": msg_fail
                        })
                    }
                })
            })

        })
    })

    app.post('/api/app/change_password', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body
        checkAccessToken(req.headers, res, (userObj) => {
            helper.CheckParameterValid(res, reqObj, ["current_password", "new_password"], () => {
                db.query("UPDATE `user_detail` SET `password`=?, `modify_date`=NOW() WHERE `user_id` = ? AND `password` = ?", [reqObj.new_password, userObj.user_id, reqObj.current_password], (err, result) => {
                    if (err) {
                        helper.ThrowHtmlError(err, res)
                        return
                    }

                    if (result.affectedRows > 0) {
                        res.json({ "status": "1", "message": msg_success })
                    } else {
                        res.json({
                            "status": "0",
                            "message": msg_fail
                        })
                    }
                })
            })

        }, "1")
    })

    app.post('/api/app/forgot_password_request', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body

        helper.CheckParameterValid(res, reqObj, ["email"], () => {
            db.query("SELECT `user_id` FROM `user_detail` WHERE `email` = ? ", [reqObj.email], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res)
                    return
                }

                if (result.length > 0) {
                    var reset_code = helper.createNumber()
                    db.query("UPDATE `user_detail` SET `reset_code` = ? WHERE `user_id` = ? ", [reset_code, result[0].user_id], (err, uResult) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res)
                            return
                        }

                        if (uResult.affectedRows > 0) {
                            // Send reset code email
                            let transporter = nodemailer.createTransport({
                                service: 'gmail', // or your email provider
                                auth: {
                                    user: 'masalamagickhurai@gmail.com', // replace with your email
                                    pass: 'xnrpvnjnqqywyrqx'    // replace with your email password or app password
                                }
                            });

                            let mailOptions = {
                                from: 'masalamagickhurai@gmail.com',
                                to: reqObj.email,
                                subject: 'Password Reset Code',
                                text: `Your password reset code is: ${reset_code}`
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                    res.json({ "status": "0", "message": "Failed to send email" });
                                } else {
                                    res.json({ "status": "1", "message": msg_success });
                                }
                            });
                        } else {
                            res.json({
                                "status": "0",
                                "message": msg_fail
                            })
                        }
                    })

                } else {
                    res.json({
                        "status": "0",
                        "message": "user not exits"
                    })
                }
            })
        })
    })

    app.post('/api/app/forgot_password_verify', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body

        helper.CheckParameterValid(res, reqObj, ["email", "reset_code"], () => {
            db.query("SELECT `user_id` FROM `user_detail` WHERE `email` = ? AND `reset_code` ", [reqObj.email, reqObj.reset_code], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res)
                    return
                }

                if (result.length > 0) {
                    var reset_code = helper.createNumber()
                    db.query("UPDATE `user_detail` SET `reset_code` = ? WHERE `user_id` = ? ", [reset_code, result[0].user_id], (err, uResult) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res)
                            return
                        }


                        if (uResult.affectedRows > 0) {
                            res.json({ "status": "1", "payload": { "user_id": result[0].user_id, "reset_code": reset_code }, "message": msg_success })
                        } else {
                            res.json({
                                "status": "0",
                                "message": msg_fail
                            })
                        }
                    })

                } else {
                    res.json({
                        "status": "0",
                        "message": "user not exits"
                    })
                }
            })
        })


    })
    app.post('/api/app/forgot_password_set_password', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body

        helper.CheckParameterValid(res, reqObj, ["user_id", "reset_code", "new_password"], () => {

            var reset_code = helper.createNumber()
            db.query("UPDATE `user_detail` SET `password` = ? , `reset_code` = ?  WHERE `user_id` = ? AND `reset_code` = ? ", [reqObj.new_password, reset_code, reqObj.user_id, reqObj.reset_code], (err, uResult) => {
                if (err) {
                    helper.ThrowHtmlError(err, res)
                    return
                }


                if (uResult.affectedRows > 0) {
                    res.json({ "status": "1", "message": "update password successfully" })
                } else {
                    res.json({
                        "status": "0",
                        "message": msg_fail
                    })
                }
            })
        })


    })

}

function checkAccessToken(headerObj, res, callback, require_type = "") {

    if (headerObj.hasOwnProperty('access_token')) {
        helper.Dlog(headerObj.access_token);
        helper.CheckParameterValid(res, headerObj, ["access_token"], () => {
            db.query("SELECT `user_id`, `username`, `user_type`, `name`, `email`, `mobile`, `mobile_code`,  `auth_token`,  `status` FROM `user_detail` WHERE `auth_token` = ? AND `status` = ? ", [headerObj.access_token, "1"], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }
                helper.Dlog(result);
                if (result.length > 0) {
                    if (require_type != "") {
                        if (require_type == result[0].user_type) {
                            return callback(result[0]);
                        } else {
                            res.json({ "status": "0", "code": "404", "message": "Access denied. Unauthorized user access." })
                        }
                    } else {
                        return callback(result[0]);
                    }
                } else {
                    res.json({ "status": "0", "code": "404", "message": "Access denied. Unauthorized user access." })
                }
            })
        })
    }

    else {
        res.json({ "status": "0", "code": "405", "message": "please Login Again Token Expired " })
    }

}