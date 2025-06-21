const db = require('./../helpers/db_helpers');
const helper = require('./../helpers/helpers');

const msg_success = "successfully";
const msg_fail = "fail";
const msg_invalidUser = "invalid username and password";
const msg_category_added = "Category added Successfully.";
const msg_category_update = "Category updated Successfully.";
const msg_category_delete = "Category deleted Successfully.";
const msg_product_added = "Product added Successfully.";
const msg_product_update = "Product updated Successfully.";
const msg_product_delete = "Product deleted Successfully.";

module.exports.controller = (app, io, socket_list) => {

    // Helper: Check access token
    function checkAccessToken(headerObj, res, callback, require_type = "") {
        helper.Dlog(headerObj.access_token);
        helper.CheckParameterValid(res, headerObj, ["access_token"], () => {
            db.query(
                "SELECT `user_id`, `username`, `user_type`, `name`, `email`, `mobile`, `mobile_code`, `auth_token`, `status` FROM `user_detail` WHERE `auth_token` = ? AND `status` = ? ",
                [headerObj.access_token, "1"],
                (err, result) => {
                    if (err) return helper.ThrowHtmlError(err, res);
                    if (result.length > 0) {
                        if (require_type && require_type != result[0].user_type) {
                            return res.json({ "status": "0", "code": "404", "message": "Access denied. Unauthorized user access." });
                        }
                        return callback(result[0]);
                    } else {
                        res.json({ "status": "0", "code": "404", "message": "Access denied. Unauthorized user access." });
                    }
                }
            );
        });
    }


    // List all restros
app.get('/restro/list', (req, res) => {
    checkAccessToken(req.headers, res, (uObj) => {
        db.query('SELECT * FROM restro ORDER BY restro_id DESC', (err, result) => {
            if (err) return helper.ThrowHtmlError(err, res);
            res.json({ status: true, data: result });
        });
    });
});

// Add a new restro
app.post('/restro/add', (req, res) => {
    checkAccessToken(req.headers, res, (uObj) => {
        const restro = {
            restro_name: req.body.restro_name,
            restro_phone: req.body.restro_phone,
            restro_adhar: req.body.restro_adhar,
        };
        db.query('INSERT INTO restro SET ?', restro, (error, results) => {
            if (error) return helper.ThrowHtmlError(error, res);
            res.json({
                status: true,
                data: results,
                message: 'Restro Saved Successfully'
            });
        });
    });
});

// Update a restro
app.put('/restro/update', (req, res) => {
    checkAccessToken(req.headers, res, (uObj) => {
        const restro_id = req.body.restro_id;
        const data = {
            restro_name: req.body.restro_name,
            restro_phone: req.body.restro_phone,
            restro_adhar: req.body.restro_adhar,
        };
        db.query('UPDATE restro SET ? WHERE restro_id = ?', [data, restro_id], (error) => {
            if (error) return helper.ThrowHtmlError(error, res);
            db.query('SELECT * FROM restro WHERE restro_id = ?', [restro_id], (error, results) => {
                if (error) return helper.ThrowHtmlError(error, res);
                res.json({
                    status: true,
                    data: results,
                    message: 'Restro Update Successfully'
                });
            });
        });
    });
});

// Delete a restro
app.delete('/restro/delete/:restro_id', (req, res) => {
    checkAccessToken(req.headers, res, (uObj) => {
        db.query('DELETE FROM restro WHERE restro_id=?', [req.params.restro_id], (err) => {
            if (err) return helper.ThrowHtmlError(err, res);
            res.json({ status: true, message: 'Restro Deleted Successfully' });
        });
    });
});

    // ========== User & Profile ==========
    app.get('/api/get_admin_profile/:user_id', (req, res) => {
        checkAccessToken(req.headers, res, (userObj) => {
            db.query('SELECT * FROM user_detail WHERE user_id=?', [req.params.user_id], (err, results) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: results });
            });
        });
    });

    app.get('/api/admin/getAllusers', (req, res) => {
        checkAccessToken(req.headers, res, (userObj) => {
            db.query('SELECT * FROM user_detail', (err, results) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: results });
            });
        });
    });
    app.get('/api/admin/getAllRiderRestroUsers', (req, res) => {
    checkAccessToken(req.headers, res, (userObj) => {
        db.query('SELECT * FROM user_detail WHERE user_type IN (1,2)', (err, results) => {
            if (err) return helper.ThrowHtmlError(err, res);
            res.json({ status: true, data: results });
        });
    });
});

    app.delete('/api/admin/delete_user/:id', (req, res) => {
        checkAccessToken(req.headers, res, (userObj) => {
            db.query('DELETE FROM user_detail WHERE user_id=?', [req.params.id], (err) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, message: 'User deleted Successfully' });
            });
        });
    });

    app.post('/api/admin/update_profile', (req, res) => {
        checkAccessToken(req.headers, res, (userObj) => {
            const reqObj = req.body;
            helper.CheckParameterValid(res, reqObj, ["username", "name", "mobile", "mobile_code", 'email'], () => {
                db.query(
                    "UPDATE `user_detail` SET `username`=?,`name`=?,`mobile`=?,`mobile_code`=?, `email`=?, `modify_date`=NOW() WHERE `user_id` = ? AND `status` = 1",
                    [reqObj.username, reqObj.name, reqObj.mobile, reqObj.mobile_code, reqObj.email, reqObj.user_id],
                    (err, result) => {
                        if (err) return helper.ThrowHtmlError(err, res);
                        if (result.affectedRows > 0) {
                            db.query(
                                'SELECT `user_id`, `username`, `name`, `email`, `mobile`, `mobile_code`, `password`, `auth_token`, `status`, `created_date` FROM `user_detail` WHERE `user_id` = ? AND `status` = "1"',
                                [userObj.user_id],
                                (err, result) => {
                                    if (err) return helper.ThrowHtmlError(err, res);
                                    if (result.length > 0) {
                                        res.json({ "status": "1", "payload": result[0], "message": msg_success });
                                    } else {
                                        res.json({ "status": "0", "message": msg_invalidUser });
                                    }
                                }
                            );
                        } else {
                            res.json({ "status": "0", "message": msg_fail });
                        }
                    }
                );
            });
        });
    });

    // ========== Category ==========
    app.post("/api/admin/product_category_add", (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            const reqObj = req.body;
            helper.CheckParameterValid(res, reqObj, ["cat_name", "color"], () => {
                db.query("INSERT INTO `category_detail`( `cat_name`, `image`, `color`, `created_date`, `modify_date`) VALUES  (?,?,?, NOW(), NOW())", [
                    reqObj.cat_name, reqObj.image, reqObj.color
                ], (err, result) => {
                    if (err) return helper.ThrowHtmlError(err, res);
                    res.json({
                        "status": "1", "payload": {
                            "cat_id": result.insertId,
                            "cat_name": reqObj.cat_name,
                            "color": reqObj.color,
                            "image": reqObj.image || '',
                        }, "message": msg_category_added
                    });
                });
            });
        });
    });

    app.post("/api/admin/product_category_update", (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            const reqObj = req.body;
            helper.CheckParameterValid(res, reqObj, ["cat_id", "cat_name", "image", "color"], () => {
                db.query("UPDATE `category_detail` SET `cat_name`=?, `image`=?, `color`=?,`modify_date`=NOW() WHERE `cat_id`= ? AND `status` = ?", [
                    reqObj.cat_name, reqObj.image, reqObj.color, reqObj.cat_id, "1"
                ], (err, result) => {
                    if (err) return helper.ThrowHtmlError(err, res);
                    res.json({
                        "status": "1", "payload": {
                            "cat_id": parseInt(reqObj.cat_id),
                            "cat_name": reqObj.cat_name,
                            "color": reqObj.color,
                            "image": reqObj.image || '',
                        }, "message": msg_category_update
                    });
                });
            });
        });
    });

    app.post('/api/admin/product_category_delete', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            const reqObj = req.body;
            helper.CheckParameterValid(res, reqObj, ["cat_id"], () => {
                db.query("UPDATE `category_detail` SET `status`= ?, `modify_date` = NOW() WHERE `cat_id`= ? ", [
                    "2", reqObj.cat_id,
                ], (err, result) => {
                    if (err) return helper.ThrowHtmlError(err, res);
                    res.json({ "status": "1", "message": msg_category_delete });
                });
            });
        }, "2");
    });

    app.post('/api/admin/product_category_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query("SELECT `cat_id`, `cat_name`, `image` , `color` FROM `category_detail` WHERE `status`= ? ", [
                "1"
            ], (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ "status": "1", "payload": result });
            });
        }, "2");
    });

    // ========== Product ==========
    app.post("/api/admin/product_add", (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            const reqObj = req.body;
            helper.CheckParameterValid(res, reqObj, ["name", "detail", "cat_id", "brand_id", "type_id", "unit_name", "unit_value", "nutrition_weight", "price", "stock_quantity", "stock_status"], () => {
                db.query("INSERT INTO `product_detail`(`cat_id`, `brand_id`, `type_id`, `name`, `detail`, `unit_name`, `unit_value`, `nutrition_weight`, `price`, `stock_quantity`, `stock_status`,`created_date`, `modify_date`) VALUES (?,?,?,?,?,?,?,?,?,?,?, NOW(), NOW() ) ", [
                    reqObj.cat_id, reqObj.brand_id, reqObj.type_id, reqObj.name, reqObj.detail, reqObj.unit_name, reqObj.unit_value, reqObj.nutrition_weight, reqObj.price, reqObj.stock_quantity, reqObj.stock_status
                ], (err, result) => {
                    if (err) return helper.ThrowHtmlError(err, res);
                    res.json({ "status": "1", "message": msg_product_added });
                });
            });
        });
    });

    app.post('/api/admin/product_update', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            const reqObj = req.body;
            helper.CheckParameterValid(res, reqObj, ["prod_id", "name", "detail", "cat_id", "brand_id", "type_id", "unit_name", "unit_value", "nutrition_weight", "price", "stock_quantity", "stock_status"], () => {
                db.query("UPDATE `product_detail` SET `cat_id`=?,`brand_id`=?,`type_id`=?,`name`=?,`detail`=?,`unit_name`=?,`unit_value`=?,`nutrition_weight`=?,`price`=?, `stock_quantity`=? ,`stock_status`=? , `modify_date`=NOW() WHERE  `prod_id`= ? AND `status` = ? ", [
                    reqObj.cat_id, reqObj.brand_id, reqObj.type_id, reqObj.name, reqObj.detail, reqObj.unit_name, reqObj.unit_value, reqObj.nutrition_weight, reqObj.price, reqObj.stock_quantity, reqObj.stock_status, reqObj.prod_id, "1"
                ], (err, result) => {
                    if (err) return helper.ThrowHtmlError(err, res);
                    res.json({ "status": "1", "message": msg_product_update });
                });
            });
        }, "2");
    });

    app.delete('/api/admin/product_delete/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('DELETE FROM product_detail WHERE prod_id=?', [req.params.id], (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ "status": "1", "message": msg_product_delete });
            });
        }, "2");
    });

    app.post('/api/admin/product_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query("SELECT * FROM  product_detail   ORDER BY prod_id DESC ", [
                "1"
            ], (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ "status": "1", "payload": result });
            });
        }, "2");
    });

    // ========== Orders ==========
    app.post("/api/admin/orderupdatestaus", (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            let orders_id = req.body.orders_id;
            let data = {
                "orders_id": req.body.orders_id,
                "order_status": req.body.order_status,
            };
            db.query('UPDATE user_order SET ? WHERE orders_id = ?', [data, orders_id], (error) => {
                if (error) return helper.ThrowHtmlError(error, res);
                db.query('SELECT * FROM user_order WHERE orders_id = ?', [orders_id], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Orders Status Update Successfully'
                    });
                });
            });
        });
    });

    app.post("/api/admin/orderupdaterider", (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            let orders_id = req.body.orders_id;
            let data = {
                "orders_id": req.body.orders_id,
                "rider_id": req.body.rider_id,
            };
            db.query('UPDATE user_order SET ? WHERE orders_id = ?', [data, orders_id], (error) => {
                if (error) return helper.ThrowHtmlError(error, res);
                db.query('SELECT * FROM user_order WHERE orders_id = ?', [orders_id], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Orders rider Update Successfully'
                    });
                });
            });
        });
    });
app.post("/api/admin/update_restaurant_status", (req, res) => {
    checkAccessToken(req.headers, res, (uObj) => {
        const orders_id = req.body.orders_id;
        let restro_ids = req.body.restro_ids;

        // Ensure restro_ids is a string (comma-separated)
        if (Array.isArray(restro_ids)) {
            restro_ids = restro_ids.join(',');
        }

        db.query(
            'UPDATE user_order SET restro_ids = ? WHERE orders_id = ?',
            [restro_ids, orders_id],
            (error) => {
                if (error) return helper.ThrowHtmlError(error, res);
                db.query('SELECT * FROM user_order WHERE orders_id = ?', [orders_id], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Restaurant(s) Updated Successfully'
                    });
                });
            }
        );
    });
});



    app.get('/api/admin/userOrderlistAll', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM user_order ORDER BY orders_id DESC', (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({
                    status: true,
                    data: result,
                    message: 'Order placed'
                });
            });
        });
    });

    // ========== Contact Book ==========
    app.get('/api/contactbook_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM contact_book ORDER BY contact_id DESC', (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: result });
            });
        });
    });

    app.post('/api/add_contactbook', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            var users = {
                "user_id": req.body.user_id,
                "contact_name": req.body.contact_name,
                "contact_number": req.body.contact_number,
                "contact_email": req.body.contact_email,
                "contact_status": req.body.contact_status,
            };
            db.query('SELECT * FROM contact_book WHERE contact_number = ?', [req.body.contact_number], (error, results) => {
                if (results.length > 0) {
                    res.json({ status: false, message: 'This Contact Already Saved' });
                } else {
                    db.query('INSERT INTO contact_book SET ?', users, (error, results) => {
                        if (error) return helper.ThrowHtmlError(error, res);
                        var id = results.insertId;
                        db.query('SELECT * FROM contact_book WHERE contact_id = ?', [id], (error, results) => {
                            if (error) return helper.ThrowHtmlError(error, res);
                            res.json({
                                status: true,
                                data: results,
                                message: 'Contact Create Successfully'
                            });
                        });
                    });
                }
            });
        });
    });

    app.put('/api/update_contact_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            let contact_id = req.body.contact_id;
            var data = {
                "user_id": req.body.user_id,
                "contact_name": req.body.contact_name,
                "contact_number": req.body.contact_number,
                "contact_email": req.body.contact_email,
                "contact_status": req.body.contact_status,
            };
            db.query('UPDATE contact_book SET ? WHERE contact_id = ?', [data, contact_id], (error) => {
                if (error) return helper.ThrowHtmlError(error, res);
                db.query('SELECT * FROM contact_book WHERE contact_id = ?', [contact_id], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Contact Update Successfully'
                    });
                });
            });
        });
    });

    app.delete('/api/delete_contact/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('DELETE FROM contact_book WHERE contact_id=?', [req.params.id], (err) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, message: 'Contact deleted Successfully' });
            });
        });
    });

    // ========== Riders ==========
    app.get('/api/rider_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM rider ORDER BY rider_id DESC', (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: result });
            });
        });
    });

    app.post('/api/add_rider', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            var users = {
                "rider_name": req.body.rider_name,
                "rider_phone": req.body.rider_phone,
                "rider_adhar": req.body.rider_adhar,
            };
            db.query('INSERT INTO rider SET ?', users, (error, results) => {
                if (error) return helper.ThrowHtmlError(error, res);
                res.json({
                    status: true,
                    data: results,
                    message: 'Rider Saved Successfully'
                });
            });
        });
    });

    app.put('/api/update_rider', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            let rider_id = req.body.rider_id;
            var data = {
                "rider_name": req.body.rider_name,
                "rider_phone": req.body.rider_phone,
                "rider_adhar": req.body.rider_adhar,
            };
            db.query('UPDATE rider SET ? WHERE rider_id  = ?', [data, rider_id], (error) => {
                if (error) return helper.ThrowHtmlError(error, res);
                db.query('SELECT * FROM rider WHERE rider_id  = ?', [rider_id], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Rider Update Successfully'
                    });
                });
            });
        });
    });

    app.delete('/api/delete_rider/:rider_id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('DELETE FROM rider WHERE rider_id=?', [req.params.rider_id], (err) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, message: 'Rider Deleted Successfully' });
            });
        });
    });

    // ========== Tax ==========
    app.get('/api/tax_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM tax ORDER BY tax_id DESC', (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: result });
            });
        });
    });

    app.post('/api/add_tax', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            var users = {
                "user_id": req.body.user_id,
                "total_tax": req.body.total_tax,
            };
            db.query('INSERT INTO tax SET ?', users, (error, results) => {
                if (error) return helper.ThrowHtmlError(error, res);
                res.json({
                    status: true,
                    data: results,
                    message: 'Tax Saved Successfully'
                });
            });
        });
    });

    app.put('/api/update_tax', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            let tax_id = req.body.tax_id;
            var data = {
                "user_id": req.body.user_id,
                "total_tax": req.body.total_tax,
            };
            db.query('UPDATE tax SET ? WHERE tax_id  = ?', [data, tax_id], (error) => {
                if (error) return helper.ThrowHtmlError(error, res);
                db.query('SELECT * FROM tax WHERE tax_id  = ?', [tax_id], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Tax Update Successfully'
                    });
                });
            });
        });
    });

    app.delete('/api/delete_tax/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('DELETE FROM tax WHERE tax_id=?', [req.params.id], (err) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, message: 'Tax Deleted Successfully' });
            });
        });
    });

    // ========== Khatabook ==========
    app.get('/api/khatabook_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM khatabook', (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: result });
            });
        });
    });

    app.post('/api/add_khatabook', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            var users = {
                "user_id": req.body.user_id,
                "customer_name": req.body.customer_name,
                "customer_number": req.body.customer_number,
                "amount": req.body.amount,
                "amount_status": req.body.amount_status,
                "total_amount": req.body.total_amount,
            };
            db.query('INSERT INTO khatabook SET ?', users, (error, results) => {
                if (error) return helper.ThrowHtmlError(error, res);
                var khatanum = results.insertId;
                db.query('SELECT * FROM khatabook WHERE khatanum = ?', [khatanum], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Khata book information insert Successfully'
                    });
                });
            });
        });
    });

    app.post('/api/addamount_khatabook', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            var users = {
                "khatanum": req.body.khatanum,
                "amount": req.body.amount,
                "amount_status": req.body.amount_status,
                "total_amount": req.body.total_amount,
                "amount_date": new Date(),
                "description": req.body.description,
            };
            db.query('INSERT INTO khata_hisab SET ?', users, (error, results) => {
                if (error) return helper.ThrowHtmlError(error, res);
                var khata_id = results.insertId;
                db.query('SELECT * FROM khata_hisab WHERE khata_id = ?', [khata_id], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Khata book Amount information insert Successfully'
                    });
                });
            });
        });
    });

    app.get('/api/khataamount_list/:khatanum', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM khata_hisab WHERE khatanum=?', [req.params.khatanum], (err, results) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: results });
            });
        });
    });

    app.delete('/api/delete_khatahisab/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('DELETE FROM khata_hisab WHERE khatanum=?', [req.params.id], (err) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, message: 'Khata Clear Successfully' });
            });
        });
    });

    app.delete('/api/delete_khatahisabCustomer/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('DELETE FROM khatabook WHERE khatanum=?', [req.params.id], (err) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, message: 'Khata deleted Successfully' });
            });
        });
    });

    // ========== Counter Bill APIs ==========
    app.get('/api/bill_list', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM book_bill ORDER BY bill_id DESC', (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: result });
            });
        });
    });

    app.get('/api/lasttoken', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT token_no FROM book_bill ORDER BY bill_id DESC LIMIT 1', (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: result });
            });
        });
    });

    app.get('/api/getbill_byTableid/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM book_bill WHERE table_id=?', [req.params.id], (err, results) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: results });
            });
        });
    });

    app.get('/api/getbill_byBill/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM book_bill WHERE bill_id=?', [req.params.id], (err, results) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: results });
            });
        });
    });

    app.get('/api/today_bill_list/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM book_bill WHERE DATE(create_date) = CURDATE() ORDER BY bill_id DESC', (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: result });
            });
        });
    });

    app.post('/api/addbill_data', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
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
            };
            var users1 = {
                "user_id": req.body.user_id,
                "contact_name": req.body.cutomer_name,
                "contact_number": req.body.cutomer_number,
                "contact_email": '',
                "contact_status": 1,
            };
            db.query('INSERT INTO book_bill SET ?', users, (error, results1) => {
                if (error) return helper.ThrowHtmlError(error, res);
                db.query('SELECT * FROM contact_book WHERE contact_number = ?', [req.body.cutomer_number], (error12, results2) => {
                    if (results2.length === 0 && users1.contact_name && users1.contact_number) {
                        db.query('INSERT INTO contact_book SET ?', users1, () => { });
                    }
                });
                res.json({
                    status: true,
                    data: results1,
                    message: 'Bill Save Successfully'
                });
            });
        });
    });

    app.put('/api/update_bill_info', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            var responseJson = JSON.stringify(req.body);
            let bill_id = req.body.bill_id;
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
            };
            db.query('UPDATE book_bill SET ? WHERE bill_id = ?', [users, bill_id], (error) => {
                if (error) return helper.ThrowHtmlError(error, res);
                db.query('SELECT * FROM book_bill WHERE bill_id = ?', [bill_id], (error, results) => {
                    if (error) return helper.ThrowHtmlError(error, res);
                    res.json({
                        status: true,
                        data: results,
                        message: 'Bill Update Successfully'
                    });
                });
            });
        });
    });

    app.put('/api/complete_order', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            let bill_no = req.body.bill_no;
            var data = {
                "bill_status": req.body.bill_status,
                "table_name": req.body.table_name,
                "table_id": req.body.table_id,
            };
            db.query('UPDATE book_bill SET ? WHERE bill_no = ?', [data, bill_no], (error, results) => {
                if (error) return helper.ThrowHtmlError(error, res);
                res.json({
                    status: true,
                    data: results,
                    message: 'Complete Order Update Successfully'
                });
            });
        });
    });

    app.delete('/api/delete_bill/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('DELETE FROM book_bill WHERE bill_id=?', [req.params.id], (error, results) => {
                if (error) return helper.ThrowHtmlError(error, res);
                res.json({
                    status: true,
                    message: 'Bill Deleted Successfully'
                });
            });
        });
    });

    // Counter bills: add, get, delete
    app.post('/api/addbills', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
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
                    if (err) return helper.ThrowHtmlError(err, res);
                    const billId = billResult.insertId;
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
                                        return helper.ThrowHtmlError(itemErr, res);
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
    });

    app.get('/api/bills', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            db.query('SELECT * FROM bills ORDER BY id DESC', (err, bills) => {
                if (err) return helper.ThrowHtmlError(err, res);
                if (!bills.length) return res.json([]);
                const billIds = bills.map(b => b.id);
                db.query('SELECT * FROM bill_items WHERE bill_id IN (?)', [billIds], (err2, items) => {
                    if (err2) return helper.ThrowHtmlError(err2, res);
                    bills.forEach(bill => {
                        bill.items = items.filter(item => item.bill_id === bill.id);
                    });
                    res.json(bills);
                });
            });
        });
    });

    app.delete('/api/billsdelete/:id', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            const billId = req.params.id;
            db.query('DELETE FROM bill_items WHERE bill_id = ?', [billId], (err1) => {
                if (err1) return helper.ThrowHtmlError(err1, res);
                db.query('DELETE FROM bills WHERE id = ?', [billId], (err2, result) => {
                    if (err2) return helper.ThrowHtmlError(err2, res);
                    if (result.affectedRows > 0) {
                        res.json({ success: true, message: 'Bill and its items deleted successfully.' });
                    } else {
                        res.status(404).json({ success: false, message: 'Bill not found.' });
                    }
                });
            });
        });
    });

    app.get('/api/get_monthly_data', (req, res) => {
        checkAccessToken(req.headers, res, (uObj) => {
            const year = req.query.year || '2025';
            const sql = `
                SELECT 
                    DATE_FORMAT(created_date, '%M') AS label, 
                    SUM(total_amt) AS y 
                FROM user_order 
                WHERE YEAR(created_date) = ? 
                GROUP BY MONTH(created_date)
                ORDER BY MONTH(created_date)
            `;
            db.query(sql, [year], (err, result) => {
                if (err) return helper.ThrowHtmlError(err, res);
                res.json({ status: true, data: result });
            });
        });
    });
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

    app.post('/api/admin/login', (req, res) => {
        helper.Dlog(req.body);
        const reqObj = req.body;
        helper.CheckParameterValid(res, reqObj, ["email", "password"], () => {
            const authToken = helper.createRequestToken();
            // First, check if user exists and is active admin
            db.query(
                "SELECT * FROM `user_detail` WHERE `user_type` = ? AND `email` = ? AND `password` = ? AND `status` = ?",
                ["2", reqObj.email, reqObj.password, "1"],
                (err, users) => {
                    if (err) return helper.ThrowHtmlError(err, res);
                    if (users.length === 0) {
                        return res.json({ status: "0", message: msg_invalidUser });
                    }
                    // Update auth_token
                    db.query(
                        "UPDATE `user_detail` SET `auth_token` = ?, `modify_date` = NOW() WHERE `user_id` = ?",
                        [authToken, users[0].user_id],
                        (err) => {
                            if (err) return helper.ThrowHtmlError(err, res);
                            // Return user info with new token
                            const user = users[0];
                            res.json({
                                status: "1",
                                payload: {
                                    user_id: user.user_id,
                                    username: user.username,
                                    name: user.name,
                                    email: user.email,
                                    mobile: user.mobile,
                                    mobile_code: user.mobile_code,
                                    auth_token: authToken,
                                    created_date: user.created_date,
                                    user_type: user.user_value,
                                },
                                message: msg_success
                            });
                        }
                    );
                }
            );
        });
    });

// ========== User Signup API ==========

app.post('/api/signup', (req, res) => {
    const reqObj = req.body;
    // Required fields for signup
    helper.CheckParameterValid(res, reqObj, [
        "username",
        "user_type", // 1=user, 2=admin
        "name",
        "email",
        "mobile",
        "mobile_code",
        "password",
        "area_id",
        "user_value"
    ], () => {
        // Check if email or mobile already exists
        db.query(
            "SELECT * FROM user_detail WHERE email = ? OR mobile = ?",
            [reqObj.email, reqObj.mobile],
            (err, users) => {
                if (err) return helper.ThrowHtmlError(err, res);
                if (users.length > 0) {
                    return res.json({ status: 0, message: "Email or mobile already registered." });
                }
                // Prepare user object
                const user = {
                    username: reqObj.username,
                    user_type: reqObj.user_type,
                    name: reqObj.name,
                    email: reqObj.email,
                    mobile: reqObj.mobile,
                    mobile_code: reqObj.mobile_code,
                    password: reqObj.password,
                    area_id: reqObj.area_id,
                    auth_token: helper.createRequestToken(),
                    reset_code: '',
                    status: 1,
                    created_date: new Date(),
                    modify_date: new Date(),
                    user_value: reqObj.user_value || ''
                };
                db.query("INSERT INTO user_detail SET ?", user, (err, result) => {
                    if (err) return helper.ThrowHtmlError(err, res);
                    res.json({
                        status: 1,
                        user_id: result.insertId,
                        auth_token: user.auth_token,
                        message: "Signup successful"
                    });
                });
            }
        );
    });
});
    
};

