var db = require('./../helpers/db_helpers')
var helper = require('./../helpers/helpers')

const msg_success = "successfully";
const msg_fail = "fail";

module.exports.controller = (app, io, socket_list) => {

    const msg_invalidUser = "invalid username and password";
    const msg_category_added = "Category added Successfully.";
    const msg_category_update = "Category updated Successfully.";
    const msg_category_delete = "Category deleted Successfully.";
    const msg_product_added = "Product added Successfully.";
    const msg_product_update = "Product updated Successfully.";
    const msg_product_delete = "Product deleted Successfully.";

    module.exports.controller = (app, io, socket_list) => {

        app.get('/api/admin/getAllTotals/:user_id', (req, res) => {
            checkAccessToken(req.headers, res, (userObj) => {
                var userid = req.params.user_id;
                db.query('SELECT count(*) as total  FROM  user_detail ', (err, result1) => {
                    db.query('SELECT count(*) as total  FROM user_order', (err, result2) => {
                        db.query('SELECT count(*) as total  FROM product_detail  ', (err, result3) => {
                            if (err) throw err;
                            var results = [];
                            results.push({
                                'Users': result1[0].total,
                                'Orders': result2[0].total,
                                'product_detail': result3[0].total,
                            });
                            res.json({
                                status: true,
                                data: results,
                                message: 'Total'
                            });
                        });
                    });
                });
            });
        });

        // Example: POST with access token
        app.post('/api/admin/update_profile', (req, res) => {
            checkAccessToken(req.headers, res, (userObj) => {
                helper.Dlog(req.body);
                var reqObj = req.body;
                helper.CheckParameterValid(res, reqObj, ["username", "name", "mobile", "mobile_code", 'email'], () => {
                    db.query("UPDATE `user_detail` SET `username`=?,`name`=?,`mobile`=?,`mobile_code`=?, `email`=?, `modify_date`=NOW() WHERE `user_id` = ? AND `status` = 1", [reqObj.username, reqObj.name, reqObj.mobile, reqObj.mobile_code, reqObj.email, reqObj.user_id], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res)
                            return
                        }
                        if (result.affectedRows > 0) {
                            db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `user_id` = ? AND `status` = "1" ', [reqObj.user_id], (err, result) => {
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
            });
        });
    }

    app.get('/api/get_admin_profile/:user_id', (req, res) => {
        db.query('SELECT * FROM user_detail WHERE user_id=?', [req.params.user_id], (err, results) => {
            if (!err) {
                res.send(results);
            } else {
                console.log(err)
            }
        });
    })


    app.get('/api/admin/getAllusers', (req, res) => {
        db.query('SELECT * FROM user_detail ', (err, results) => {
            if (!err) {
                res.send(results);
            } else {
                console.log(err)
            }
        });
    });


    app.get('/api/get_monthly_data', (req, res) => {
        var year = '2025'
        let sql = `(SELECT Date_format(created_date, '%M') AS label, Sum(total_amt) AS y FROM user_order WHERE Year(created_date) = ${year} )`;
        // var sql1 = 'SELECT * FROM users WHERE email = ? OR phone_number = ?';
        db.query(sql, (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })

    })


    app.delete('/api/admin/delete_user/:id', (req, res) => {
        db.query('DELETE FROM user_detail WHERE user_id=?', [req.params.id], (err, rows, fields) => {
            if (!err) {
                res.json({
                    status: true,
                    message: 'User deleted Successfully'
                })
            } else {
                console.log(err)
            }
        });
    });
    app.post('/api/admin/update_profile', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body

        // checkAccessToken(req.headers, res, (userObj) => {
        helper.CheckParameterValid(res, reqObj, ["username", "name", "mobile", "mobile_code", 'email'], () => {
            db.query("UPDATE `user_detail` SET `username`=?,`name`=?,`mobile`=?,`mobile_code`=?, `email`=?, `modify_date`=NOW() WHERE `user_id` = ? AND `status` = 1", [reqObj.username, reqObj.name, reqObj.mobile, reqObj.mobile_code, reqObj.email, reqObj.user_id], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res)
                    return
                }

                if (result.affectedRows > 0) {
                    db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `user_id` = ? AND `status` = "1" ', [reqObj.user_id], (err, result) => {

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

        // })
    })
    app.post('/api/admin/login', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;
        helper.CheckParameterValid(res, reqObj, ["email", "password"], () => {

            var authToken = helper.createRequestToken();
            db.query("UPDATE `user_detail` SET `auth_token` = ?, `modify_date` = NOW() WHERE `user_type` = ? AND `email` = ? AND `password` = ? AND `status` = ? ", [authToken, "2", reqObj.email, reqObj.password, "1"], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }

                if (result.affectedRows > 0) {

                    db.query('SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `auth_token`, `created_date` FROM `user_detail` WHERE `email` = ? AND `password` = ? AND `status` = "1" ', [reqObj.email, reqObj.password], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if (result.length > 0) {
                            res.json({
                                'status': '1',
                                'payload': result[0],
                                'message': msg_success
                            })
                        } else {
                            res.json({
                                'status': '0',
                                'message': msg_invalidUser
                            })
                        }


                    })

                } else {
                    res.json({
                        'status': '0',
                        'message': msg_invalidUser
                    })
                }
            })
        })
    })



    // ---------------------------------------------  Category_add  ----------------------------------------------------------------
    app.post("/api/admin/product_category_add", (req, res) => {
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (uObj) => {
            helper.CheckParameterValid(res, reqObj, ["cat_name", "color"], () => {
                db.query("INSERT INTO `category_detail`( `cat_name`, `image`, `color`, `created_date`, `modify_date`) VALUES  (?,?,?, NOW(), NOW())", [
                    reqObj.cat_name, reqObj.image, reqObj.color
                ], (err, result) => {
                    if (err) {
                        helper.ThrowHtmlError(err, res);
                        return;
                    }

                    if (result) {
                        res.json({
                            "status": "1", "payload": {
                                "cat_id": result.insertId,
                                "cat_name": reqObj.cat_name[0],
                                "color": reqObj.color[0],
                                "image": '',
                            }, "message": msg_category_added
                        });
                    } else {
                        res.json({ "status": "0", "message": msg_fail })
                    }
                })
            })
        })
    })


    app.post("/api/admin/orderupdatestaus", (req, res) => {
        let orders_id = req.body.orders_id
        var data = {
            "orders_id": req.body.orders_id,
            "order_status": req.body.order_status,

        }
        // 1: new, 2: order_accept, 3: Out_for_delivery, 4: order_delivered, 5: cancel, 6: order declined

        db.query('UPDATE user_order SET ? WHERE orders_id = ?', [data, orders_id], function (error, results, fields) {

            if (error) {
                res.json({
                    status: false,
                    message: 'there are some error with query'
                })
            } else {
                var id = orders_id;
                db.query('SELECT * FROM user_order WHERE orders_id = ?', [id], function (error, results, fields) {
                    res.json({
                        status: true,
                        data: results,
                        message: 'Orders Status Update  Successfully'
                    })
                })
            }
        })
    })
    app.post("/api/admin/orderupdaterider", (req, res) => {
        let orders_id = req.body.orders_id
        var data = {
            "orders_id": req.body.orders_id,
            "rider_id": req.body.rider_id,

        }
        // 1: new, 2: order_accept, 3: Out_for_delivery, 4: order_delivered, 5: cancel, 6: order declined

        db.query('UPDATE user_order SET ? WHERE orders_id = ?', [data, orders_id], function (error, results, fields) {

            if (error) {
                res.json({
                    status: false,
                    message: 'there are some error with query'
                })
            } else {
                var id = orders_id;
                db.query('SELECT * FROM user_order WHERE orders_id = ?', [id], function (error, results, fields) {
                    res.json({
                        status: true,
                        data: results,
                        message: 'Orders rider Update  Successfully'
                    })
                })
            }
        })
    })
    app.get('/api/admin/userOrderlistAll', (req, res) => {
        db.query('SELECT * FROM  user_order  ORDER BY orders_id DESC', (err, result) => {
            if (err) throw err;
            else {
                res.json({
                    status: true,
                    data: result, // <-- send result directly
                    message: 'Order placed'
                });
            }
        });
    });
    // ----------------------------------------------------Product_category_update-----------------------------------------------------

    app.post("/api/admin/product_category_update", (req, res) => {
        var reqObj = req.body;
        var condition = '';
        // checkAccessToken(req.headers, res, (uObj) => {
        helper.CheckParameterValid(res, reqObj, ["cat_id", "cat_name", "image", "color"], () => {
            db.query("UPDATE `category_detail` SET `cat_name`=?, `image`=?," + condition + " `color`=?,`modify_date`=NOW() WHERE `cat_id`= ? AND `status` = ?", [
                reqObj.cat_name, reqObj.image, reqObj.color, reqObj.cat_id, "1"
            ], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if (result) {
                    res.json({
                        "status": "1", "payload": {
                            "cat_id": parseInt(reqObj.cat_id[0]),
                            "cat_name": reqObj.cat_name[0],
                            "color": reqObj.color[0],
                            "image": '',
                        }, "message": msg_category_update
                    });
                } else {
                    res.json({ "status": "0", "message": msg_fail })
                }

            })
        })
        // })

    })
    // ---------------------------------------------------delete_category---------------------------------------------------
    app.post('/api/admin/product_category_delete', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;

        helper.CheckParameterValid(res, reqObj, ["cat_id"], () => {

            checkAccessToken(req.headers, res, (uObj) => {
                db.query("UPDATE `category_detail` SET `status`= ?, `modify_date` = NOW() WHERE `cat_id`= ? ", [
                    "2", reqObj.cat_id,
                ], (err, result) => {

                    if (err) {
                        helper.ThrowHtmlError(err, res);
                        return;
                    }

                    if (result.affectedRows > 0) {
                        res.json({
                            "status": "1", "message": msg_category_delete
                        });
                    } else {
                        res.json({ "status": "0", "message": msg_fail })
                    }

                })
            }, "2")
        })
    })
    // -------------------------------------------------------------------------------------------------------------------
    app.post('/api/admin/product_category_list', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;

        checkAccessToken(req.headers, res, (uObj) => {
            db.query("SELECT `cat_id`, `cat_name`, `image` , `color` FROM `category_detail` WHERE `status`= ? ", [
                "1"
            ], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                res.json({
                    "status": "1", "payload": result
                });
            })
        }, "2")
    })

    //////////////////////////////////////////============Product list===========//////////////////////////////////////////////////////////////////

    app.post("/api/admin/product_add", (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            var reqObj = req.body;
            helper.Dlog("---------- Parameter ----")
            helper.Dlog(reqObj)
            helper.CheckParameterValid(res, reqObj, ["name", "detail", "cat_id", "brand_id", "type_id", "unit_name", "unit_value", "nutrition_weight", "price", "stock_quantity", "stock_status"], () => {
                db.query("INSERT INTO `product_detail`(`cat_id`, `brand_id`, `type_id`, `name`, `detail`, `unit_name`, `unit_value`, `nutrition_weight`, `price`, `stock_quantity`, `stock_status`,`created_date`, `modify_date`) VALUES (?,?,?, ?,?,?, ?,?,?,?,?, NOW(), NOW() ) ", [reqObj.cat_id, reqObj.brand_id, reqObj.type_id, reqObj.name, reqObj.detail, reqObj.unit_name, reqObj.unit_value, reqObj.nutrition_weight, reqObj.price, reqObj.stock_quantity, reqObj.stock_status], (err, result) => {
                    if (err) {
                        helper.ThrowHtmlError(err, res);
                        return
                    }
                    if (result) {

                        res.json({
                            "status": "1", "message": msg_product_added
                        });

                    } else {
                        res.json({ "status": "0", "message": msg_fail })
                    }
                })
            })

        })
    })

    app.post('/api/admin/product_update', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;

        helper.CheckParameterValid(res, reqObj, ["prod_id", "name", "detail", "cat_id", "brand_id", "type_id", "unit_name", "unit_value", "nutrition_weight", "price", "stock_quantity", "stock_status"], () => {

            checkAccessToken(req.headers, res, (uObj) => {

                db.query("UPDATE `product_detail` SET `cat_id`=?,`brand_id`=?,`type_id`=?,`name`=?,`detail`=?,`unit_name`=?,`unit_value`=?,`nutrition_weight`=?,`price`=?, `stock_quantity`=? ,`stock_status`=? , `modify_date`=NOW() WHERE  `prod_id`= ? AND `status` = ? ", [
                    reqObj.cat_id, reqObj.brand_id, reqObj.type_id, reqObj.name, reqObj.detail, reqObj.unit_name, reqObj.unit_value, reqObj.nutrition_weight, reqObj.price, reqObj.stock_quantity, reqObj.stock_status, reqObj.prod_id, "1"
                ], (err, result) => {

                    if (err) {
                        helper.ThrowHtmlError(err, res);
                        return;
                    }

                    if (result.affectedRows > 0) {
                        res.json({
                            "status": "1", "message": msg_product_update
                        });
                    } else {
                        res.json({ "status": "0", "message": msg_fail })
                    }

                })
            }, "2")
        })
    })

    app.delete('/api/admin/product_delete/:id', (req, res) => {
        helper.Dlog(req.body);
        var reqObj = req.body;
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('DELETE FROM product_detail WHERE prod_id=?', [req.params.id], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                if (result.affectedRows > 0) {
                    res.json({
                        "status": "1", "message": msg_product_delete
                    });
                } else {
                    res.json({ "status": "0", "message": msg_fail })
                }

            })
        }, "2")
    })
    app.post('/api/admin/product_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query("SELECT * FROM  product_detail   ORDER BY prod_id DESC ", [
                "1"
            ], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return;
                }

                res.json({
                    "status": "1", "payload": result
                });
            })
        }, "2")

    })


    // ========================================================contact book ===============================///////////////////////////////////////


    app.get('/api/contactbook_list', (req, res) => {
        db.query('SELECT * FROM contact_book ORDER BY contact_id DESC ', (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })
    })

    app.post('/api/add_contactbook', (req, res) => {
        var users = {
            "user_id": req.body.user_id,
            "contact_name": req.body.contact_name,
            "contact_number": req.body.contact_number,
            "contact_email": req.body.contact_email,
            "contact_status": req.body.contact_status,
        }
        db.query('SELECT * FROM contact_book WHERE contact_number = ?', [req.body.contact_number], function (error, results, fields) {
            if (results.length > 0) {
                res.json({
                    status: false,
                    message: 'This Contact Already Saved'
                })
            }
            else {
                db.query('INSERT INTO contact_book SET ?', users, function (error, results, fields) {
                    if (error) {
                        res.json({
                            status: false,
                            message: error
                        })
                    } else {
                        var id = results.insertId;
                        db.query('SELECT * FROM contact_book WHERE contact_id = ?', [id], function (error, results, fields) {
                            res.json({
                                status: true,
                                data: results,
                                message: 'Contact  Create  Successfully'
                            })
                        })
                    }
                })
            }
        })
    })

    app.put('/api/update_contact_list', (req, res) => {
        let contact_id = req.body.contact_id
        var data = {
            "user_id": req.body.user_id,
            "contact_name": req.body.contact_name,
            "contact_number": req.body.contact_number,
            "contact_email": req.body.contact_email,
            "contact_status": req.body.contact_status,
        }

        db.query('UPDATE contact_book SET ? WHERE contact_id = ?', [data, contact_id], function (error, results, fields) {
            if (error) {
                res.json({
                    status: false,
                    message: 'there are some error with query'
                })
            } else {
                var id = contact_id;
                db.query('SELECT * FROM contact_book WHERE contact_id = ?', [id], function (error, results, fields) {
                    res.json({
                        status: true,
                        data: results,
                        message: 'Conatct   Update  Successfully'
                    })
                })
            }

        })

    })

    app.delete('/api/delete_contact/:id', (req, res) => {
        db.query('DELETE FROM contact_book WHERE contact_id=?', [req.params.id], (err, rows, fields) => {
            if (!err) {
                res.json({
                    status: true,
                    message: 'Contact deleted Successfully'
                })
            } else {
                console.log(err)
            }
        });
    })
    // ==========================================================================================================



    app.get('/api/rider_list', (req, res) => {
        db.query('SELECT * FROM  rider  ORDER BY rider_id DESC ', (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })
    })

    app.post('/api/add_rider', (req, res) => {
        var users = {
            "rider_name": req.body.rider_name,
            "rider_phone": req.body.rider_phone,
            "rider_adhar": req.body.rider_adhar,
        }
        db.query('INSERT INTO rider SET ?', users, function (error, results, fields) {

            if (error) {
                res.json({
                    status: false,
                    message: error
                })
            } else {
                res.json({
                    status: true,
                    data: results,
                    message: 'Rider Saved Successfully'
                })

            }
        })
    })

    app.put('/api/update_rider', (req, res) => {
        let rider_id = req.body.rider_id
        var data = {
            "rider_name": req.body.rider_name,
            "rider_phone": req.body.rider_phone,
            "rider_adhar": req.body.rider_adhar,
        }

        db.query('UPDATE rider SET ? WHERE rider_id  = ?', [data, rider_id], function (error, results, fields) {

            if (error) {
                res.json({
                    status: false,
                    message: 'there are some error with query'
                })
            } else {
                var id = rider_id;
                db.query('SELECT * FROM rider WHERE rider_id  = ?', [rider_id], function (error, results, fields) {
                    res.json({
                        status: true,
                        data: results,
                        message: 'rider  Update  Successfully'
                    })
                })
            }
        })
    })

    app.delete('/api/delete_rider/:rider_id', (req, res) => {
        db.query('DELETE FROM rider WHERE rider_id=?', [req.params.rider_id], (err) => {
            if (!err) {
                res.json({
                    status: true,
                    message: 'rider Deleted Successfully'
                })
            } else {
            }
        });
    });


    //==================================tax===========================/////////////////////////////////////////

    app.get('/api/tax_list', (req, res) => {
        db.query('SELECT * FROM  tax  ORDER BY tax_id DESC ', (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })
    })

    app.post('/api/add_tax', (req, res) => {
        var users = {
            "user_id": req.body.user_id,
            "total_tax": req.body.total_tax,
        }
        db.query('INSERT INTO tax SET ?', users, function (error, results, fields) {

            if (error) {
                res.json({
                    status: false,
                    message: error
                })
            } else {
                res.json({
                    status: true,
                    data: results,
                    message: 'tax Saved Successfully'
                })

            }
        })
    })

    app.put('/api/update_tax', (req, res) => {
        let tax_id = req.body.tax_id
        var data = {
            "user_id": req.body.user_id,
            "total_tax": req.body.total_tax,
        }

        db.query('UPDATE tax SET ? WHERE tax_id  = ?', [data, tax_id], function (error, results, fields) {

            if (error) {
                res.json({
                    status: false,
                    message: 'there are some error with query'
                })
            } else {
                var id = tax_id;
                db.query('SELECT * FROM tax WHERE tax_id  = ?', [id], function (error, results, fields) {
                    res.json({
                        status: true,
                        data: results,
                        message: 'Tax  Update  Successfully'
                    })
                })
            }
        })
    })

    app.delete('/api/delete_tax/:id', (req, res) => {
        db.query('DELETE FROM tax WHERE tax_id=?', [req.params.id], (err) => {
            if (!err) {
                res.json({
                    status: true,
                    message: 'Tax Deleted Successfully'
                })
            } else {
            }
        });
    });

    ///////////////////////////---=================================khatabook=============================================////////////////

    app.get('/api/khatabook_list', (req, res) => {
        db.query('SELECT * FROM khatabook', (err, result) => {
            if (err) throw err;
            console.log(result)
            res.end(JSON.stringify(result));
        })
    })
    app.post('/api/add_khatabook', (req, res) => {

        console.log(req.body)
        var users = {
            "user_id": req.body.user_id,
            "customer_name": req.body.customer_name,
            "customer_number": req.body.customer_number,
            "amount": req.body.amount,
            "amount_status": req.body.amount_status,
            "total_amount": req.body.total_amount,
        }

        db.query('INSERT INTO  khatabook SET ?', users, function (error, results, fields) {
            if (error) {
                res.json({
                    status: false,
                    message: error + 'there are some error with query'
                })
            } else {
                var khatanum = results.insertId;
                console.log(khatanum + 'id')

                db.query('SELECT * FROM khatabook WHERE khatanum = ?', [khatanum], function (error, results, fields) {
                    res.json({
                        status: true,
                        data: results,
                        // fields: fields,
                        message: 'Khata book information  insert Successfully'
                    })
                })
            }
        })
    })
    app.post('/api/addamount_khatabook', (req, res) => {
        var users = {
            "khatanum": req.body.khatanum,
            "amount": req.body.amount,
            "amount_status": req.body.amount_status,
            "total_amount": req.body.total_amount,
            "amount_date": new Date(),
            "description": req.body.description,
        }
        db.query('INSERT INTO  khata_hisab SET ?', users, function (error, results, fields) {
            if (error) {
                res.json({
                    status: false,
                    message: error + 'there are some error with query'
                })
            } else {
                var khata_id = results.insertId;
                console.log(khata_id + 'id')

                db.query('SELECT * FROM khata_hisab WHERE khata_id = ?', [khata_id], function (error, results, fields) {
                    res.json({
                        status: true,
                        data: results,
                        // fields: fields,
                        message: 'Khata book Amount information  insert Successfully'
                    })
                })
            }
        })
    })
    app.get('/api/khataamount_list/:khatanum', (req, res) => {
        db.query('SELECT * FROM khata_hisab WHERE khatanum=?', [req.params.khatanum], (err, results) => {
            if (!err) {
                res.send(results);
            } else {
                console.log(err)
            }
        });
    })
    app.delete('/api/delete_khatahisab/:id', (req, res) => {
        db.query('DELETE FROM khata_hisab WHERE khatanum=?', [req.params.id], (err) => {
            if (!err) {
                res.json({
                    status: true,
                    message: 'Khata Clear Successfully'

                })
            } else {
                console.log(err)
            }
        });
    })
    app.delete('/api/delete_khatahisabCustomer/:id', (req, res) => {
        db.query('DELETE FROM khatabook WHERE khatanum=?', [req.params.id], (err) => {
            if (!err) {
                console.log('deleted')
                res.json({
                    status: true,
                    message: ' Khata deleted Successfully'

                })
            } else {
                console.log(err)
            }
        });
    })


    //////////////////////////////////////////////===========Counter bill page apis====================//////////////////////////////////


    app.get('/api/bill_list', (req, res) => {
        db.query('SELECT * FROM  book_bill ORDER BY bill_id DESC  ', (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })
    })

    app.get('/api/lasttoken', (req, res) => {
        db.query('SELECT   token_no FROM  book_bill ORDER BY bill_id DESC LIMIT 1  ', (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })
    })
    app.get('api/getbill_byTableid/:id', (req, res) => {
        db.query('SELECT * FROM book_bill WHERE  table_id=?', [req.params.id], (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    })
    app.get('api/getbill_byBill/:id', (req, res) => {
        db.query('SELECT * FROM book_bill WHERE  bill_id=?', [req.params.id], (err, results) => {
            if (err) throw err;
            res.end(JSON.stringify(results));
        });
    })
    app.get('api/today_bill_list/:id', (req, res) => {
        db.query('SELECT * FROM  book_bill  and  create_date =' + GETDATE() + ' ORDER BY bill_id DESC  ', (err, result) => {
            if (err) throw err;
            res.end(JSON.stringify(result));
        })
    })
    app.post('/api/addbill_data', (req, res) => {
        var responseJson = JSON.stringify(req.body);
        var users = {
            "user_id": req.body.user_id,
            "bill_no": req.body.bill_no,
            "bill_order": responseJson,
            "table_id": req.body.table_id,
            "table_name": req.body.table_name,
            "total_bill": req.body.total_bill,
            "bill_status": req.body.bill_status,
            "cutomer_name": req.body.cutomer_name,
            "cutomer_number": req.body.cutomer_number,
            "create_date": req.body.create_date,
            "cutomer_address": req.body.cutomer_address,
            "delivery_charge": req.body.delivery_charge,
            "discount": req.body.discount,
            "status": req.body.status,
            "attender_id": req.body.attender_id,
            "attender_name": req.body.attender_name,
            "token_no": req.body.token_no,
            "payment_type": req.body.payment_type,
            "subtotal_bill": req.body.subtotal_bill,
            "gst_amt": req.body.gst_amt,
        }
        var users1 = {
            "user_id": req.body.user_id,
            "contact_name": req.body.cutomer_name,
            "contact_number": req.body.cutomer_number,
            "contact_email": '',
            "contact_status": 1,
        }

        db.query('INSERT INTO  book_bill SET ?', users, function (error, results1, fields) {
            if (error) {
                res.json({
                    status: false,
                    message: error + 'there are some error with query'
                })
            }
            else {
                db.query('SELECT * FROM contact_book WHERE contact_number = ?', [req.body.cutomer_number], function (error12, results2, fields) {
                    if (results2.length === 0) {
                        if (users1.contact_name.length !== 0 && users1.contact_number.length !== 0) {
                            db.query('INSERT INTO contact_book SET ?', users1, function (error11, results, fields) {
                            })
                        }
                    }
                })
                res.json({
                    status: true,
                    data: results1,
                    message: 'Bill Save  Successfully'
                })
            }
        });
    })
    app.put('/api/update_bill_info', (req, res) => {
        var responseJson = JSON.stringify(req.body);
        let bill_id = req.body.bill_id
        var users = {
            "user_id": req.body.user_id,
            "bill_no": req.body.bill_no,
            "bill_order": responseJson,
            "table_id": req.body.table_id,
            "table_name": req.body.table_name,
            "total_bill": req.body.total_bill,
            "bill_status": req.body.bill_status,
            "cutomer_name": req.body.cutomer_name,
            "cutomer_number": req.body.cutomer_number,
            "create_date": req.body.create_date,
            "delivery_charge": req.body.delivery_charge,
            "discount": req.body.discount,
            "status": req.body.status,
            "attender_id": req.body.attender_id,
            "attender_name": req.body.attender_name,
            "token_no": req.body.token_no,
            "payment_type": req.body.payment_type,
            "subtotal_bill": req.body.subtotal_bill,
            "gst_amt": req.body.gst_amt,

        }

        db.query('UPDATE  book_bill SET ? WHERE bill_id = ?', [users, bill_id], function (error, results, fields) {

            if (error) {
                res.json({
                    status: false,
                    message: 'there are some error with query'
                })
            } else {

                db.query('SELECT * FROM  book_bill WHERE bill_id = ?', [bill_id], function (error, results, fields) {
                    res.json({
                        status: true,
                        data: results,
                        message: 'Bill  Update  Successfully'
                    })
                })
            }
        })
    })
    app.put('/api/complete_order', (req, res) => {
        let bill_no = req.body.bill_no
        var data = {
            "bill_status": req.body.bill_status,
            "table_name": req.body.table_name,
            "table_id": req.body.table_id,
        }
        db.query('UPDATE  book_bill SET ? WHERE bill_no = ?', [data, bill_no], function (error, results, fields) {

            if (error) {
                res.json({
                    status: false,
                    message: 'there are some error with query'
                })
            } else {

                res.json({
                    status: true,
                    data: results,
                    message: 'Compete Order  Update  Successfully'
                })
            }
        })
    })
    app.delete('/api/delete_bill/:id', (req, res) => {
        db.query('DELETE FROM book_bill WHERE bill_id=?', [req.params.id], function (error, results, fields) {
            if (!error) {
                res.json({
                    status: true,
                    message: 'Bill Deleted Successfully'

                })
            } else {
                console.log(error)
            }
        });
    })

    //-----------------------------------------------------Counter bills-------------------------------------------------------------------------

    app.post('/api/addbills', (req, res) => {
        const bill = req.body;
        db.query(
            `INSERT INTO bills 
      (token_no, customer_name, customer_number, table_no, order_type, discount_type, discount_value, discount_amount, sub_total, discounted_sub_total, tax, total_tax_percent, grand_total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                bill.tokenNo,
                bill.customerName,
                bill.customerNumber,
                bill.tableNo,
                bill.orderType,
                bill.discountType,
                bill.discountValue,
                bill.discountAmount,
                bill.subTotal,
                bill.discountedSubTotal,
                bill.tax,
                bill.totalTaxPercent,
                bill.grandTotal
            ],
            (err, billResult) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, error: err.message });
                }
                const billId = billResult.insertId;

                // 2. Insert bill items
                if (Array.isArray(bill.cart) && bill.cart.length > 0) {
                    let completed = 0;
                    let hasError = false;
                    bill.cart.forEach((item) => {
                        db.query(
                            `INSERT INTO bill_items (bill_id, prod_id, prod_name, cat_id, qty, price, total)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                            [
                                billId,
                                item.prod_id,
                                item.name,
                                item.cat_id,
                                item.qty,
                                item.price,
                                item.price * item.qty
                            ],
                            (itemErr) => {
                                if (itemErr && !hasError) {
                                    hasError = true;
                                    return res.status(500).json({ success: false, error: itemErr.message });
                                }
                                completed++;
                                if (completed === bill.cart.length && !hasError) {
                                    res.json({ success: true, billId });
                                }
                            }
                        );
                    });
                } else {
                    res.json({ success: true, billId });
                }
            }
        );
    });

    app.get('/api/bills', (req, res) => {
        db.query('SELECT * FROM bills ORDER BY id DESC', (err, bills) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!bills.length) return res.json([]);

            // Get all bill items for these bills
            const billIds = bills.map(b => b.id);
            db.query('SELECT * FROM bill_items WHERE bill_id IN (?)', [billIds], (err2, items) => {
                if (err2) {
                    return res.status(500).json({ error: err2.message });
                }
                // Attach items to their respective bills
                bills.forEach(bill => {
                    bill.items = items.filter(item => item.bill_id === bill.id);
                });
                res.json(bills);
            });
        });
    });

    app.delete('/api/billsdelete/:id', (req, res) => {
        const billId = req.params.id;
        db.query('DELETE FROM bill_items WHERE bill_id = ?', [billId], (err1) => {
            if (err1) {
                return res.status(500).json({ success: false, error: err1.message });
            }
            // Then, delete the bill
            db.query('DELETE FROM bills WHERE id = ?', [billId], (err2, result) => {
                if (err2) {
                    return res.status(500).json({ success: false, error: err2.message });
                }
                if (result.affectedRows > 0) {
                    res.json({ success: true, message: 'Bill and its items deleted successfully.' });
                } else {
                    res.status(404).json({ success: false, message: 'Bill not found.' });
                }
            });
        });
    });
    // =========================================================================================================================================

    function checkAccessToken(headerObj, res, callback, require_type = "") {
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
}