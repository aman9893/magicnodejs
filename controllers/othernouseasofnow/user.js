

app.post('/api/app/add_remove_favorite', (req, res) => {
    helper.Dlog(req.body)
    var reqObj = req.body;
    checkAccessToken(req.headers, res, (userObj) => {
        helper.CheckParameterValid(res, reqObj, ["prod_id"], () => {
            db.query("SELECT `fav_id`, `prod_id` FROM `favorite_detail` WHERE `prod_id` = ? AND `user_id` = ? AND `status` = '1' ", [reqObj.prod_id, userObj.user_id], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res);
                    return
                }

                if (result.length > 0) {
                    // Already add Favorite List To Delete Fave
                    db.query("DELETE FROM `favorite_detail` WHERE `prod_id` = ? AND `user_id` = ? ", [reqObj.prod_id, userObj.user_id], (err, result) => {

                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        } else {
                            res.json({
                                "status": "1",
                                "message": msg_removed_favorite
                            })
                        }
                    })

                } else {
                    // Not Added  Favorite List TO Add
                    db.query("INSERT INTO `favorite_detail`(`prod_id`, `user_id`) VALUES (?,?) ", [
                        reqObj.prod_id, userObj.user_id
                    ], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res);
                            return
                        }

                        if (result) {
                            res.json({
                                "status": "1",
                                "message": msg_added_favorite
                            })
                        } else {
                            res.json({
                                "status": "0",
                                "message": msg_fail
                            })
                        }
                    })

                }
            })
        })
    }, '1')
})

app.post('/api/app/favorite_list', (req, res) => {
    helper.Dlog(req.body)
    var reqObj = req.body;

    checkAccessToken(req.headers, res, (userObj) => {

        db.query("SELECT `fd`.`fav_id`, `pd`.`prod_id`, `pd`.`cat_id`, `pd`.`brand_id`,  `pd`.`type_id`, `pd`.`name`, `pd`.`detail`, `pd`.`unit_name`, `pd`.`unit_value`, `pd`.`nutrition_weight`, `pd`.`price`, `pd`.`created_date`, `pd`.`modify_date`, `cd`.`cat_name`, IFNULL( `bd`.`brand_name`, '' ) AS `brand_name` , `td`.`type_name`, IFNULL(`od`.`price`, `pd`.`price` ) as `offer_price`, IFNULL(`od`.`start_date`,'') as `start_date`, IFNULL(`od`.`end_date`,'') as `end_date`, (CASE WHEN `od`.`offer_id` IS NOT NULL THEN 1 ELSE 0 END) AS `is_offer_active`, 1 AS `is_fav` `favorite_detail` AS  `fd` " +
            "INNER JOIN  `product_detail` AS `pd` ON  `pd`.`prod_id` = `fd`.`prod_id` AND `pd`.`status` = 1 " +
            "INNER JOIN `category_detail` AS `cd` ON `pd`.`cat_id` = `cd`.`cat_id` " +
            "INNER JOIN `image_detail` AS `imd` ON `pd`.`prod_id` = `imd`.`prod_id` AND `imd`.`status` = 1 " +
            "LEFT JOIN `brand_detail` AS `bd` ON `pd`.`brand_id` = `bd`.`brand_id` " +
            "LEFT JOIN `offer_detail` AS `od` ON `pd`.`prod_id` = `od`.`prod_id` AND `od`.`status` = 1 AND `od`.`start_date` <= NOW() AND `od`.`end_date` >= NOW() " +
            "INNER JOIN `type_detail` AS `td` ON `pd`.`type_id` = `td`.`type_id` " +
            " WHERE `fd`.`user_id` = ? AND `fd`.`status` = '1' GROUP BY `pd`.`prod_id` ", [userObj.user_id], (err, result) => {
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

app.post('/api/app/add_to_cart', (req, res) => {
    helper.Dlog(req.body)
    var reqObj = req.body

    checkAccessToken(req.headers, res, (userObj) => {
        helper.CheckParameterValid(res, reqObj, ["prod_id", "qty"], () => {

            db.query("Select `prod_id` FROM `product_detail` WHERE  `prod_id` = ? AND `status` = 1 ", [reqObj.prod_id], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res)
                    return;
                }

                if (result.length > 0) {
                    //Valid Item

                    db.query("INSERT INTO `cart_detail`(`user_id`, `prod_id`, `qty`) VALUES (?,?,?) ", [userObj.user_id, reqObj.prod_id, reqObj.qty], (err, result) => {
                        if (err) {
                            helper.ThrowHtmlError(err, res)
                            return
                        }

                        if (result) {
                            res.json({
                                "status": "1",
                                "message": msg_add_to_item
                            })
                        } else {
                            res.json({
                                "status": "0",
                                "message": msg_fail
                            })
                        }
                    })
                } else {
                    //Invalid Item
                    res.json({
                        "status": "0",
                        "message": msg_invalid_item
                    })
                }
            })
        })
    })
})

app.post('/api/app/update_cart', (req, res) => {
    helper.Dlog(req.body)
    var reqObj = req.body

    checkAccessToken(req.headers, res, (userObj) => {
        helper.CheckParameterValid(res, reqObj, ["cart_id", "prod_id", "new_qty"], () => {

            // Valid
            var status = "1"

            if (reqObj.new_qty == "0") {
                status = "2"
            }
            db.query("UPDATE `cart_detail` SET `qty`= ? , `status`= ?, `modify_date`= NOW() WHERE `cart_id` = ? AND `prod_id` = ? AND `user_id` = ? AND `status` = ? ", [reqObj.new_qty, status, reqObj.cart_id, reqObj.prod_id, userObj.user_id, "1"], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res)
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

app.post('/api/app/remove_cart', (req, res) => {
    helper.Dlog(req.body)
    var reqObj = req.body

    checkAccessToken(req.headers, res, (userObj) => {
        helper.CheckParameterValid(res, reqObj, ["cart_id", "prod_id"], () => {


            db.query("UPDATE `cart_detail` SET `status`= '2', `modify_date`= NOW() WHERE `cart_id` = ? AND `prod_id` = ? AND  `user_id` = ? AND  `status` = ? ", [reqObj.cart_id, reqObj.prod_id, userObj.user_id, "1"], (err, result) => {

                if (err) {
                    helper.ThrowHtmlError(err, res)
                    return
                }

                if (result.affectedRows > 0) {
                    res.json({
                        "status": "1",
                        "message": msg_remove_to_cart
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

app.post('/api/app/cart_list', (req, res) => {
    helper.Dlog(req.body)
    var reqObj = req.body

    checkAccessToken(req.headers, res, (userObj) => {
        getUserCart(res, userObj.user_id, (result, total) => {

            var promo_code_id = reqObj.promo_code_id;
            if (promo_code_id == undefined || promo_code_id == null) {
                promo_code_id = ""
            }

            var deliver_type = reqObj.deliver_type;
            if (deliver_type == undefined || deliver_type == null) {
                deliver_type = "1"
            }

            db.query(
                'SELECT `promo_code_id`, `min_order_amount`, `max_discount_amount`, `offer_price` FROM `promo_code_detail` WHERE  `start_date` <= NOW() AND `end_date` >= NOW()  AND `status` = 1  AND `promo_code_id` = ? ;'
                , [reqObj.promo_code_id], (err, pResult) => {
                    if (err) {
                        helper.ThrowHtmlError(err, res)
                        return
                    }

                    var deliver_price_amount = 0.0

                    if (deliver_type == "1") {
                        deliver_price_amount = deliver_price
                    } else {
                        deliver_price_amount = 0.0;
                    }


                    var final_total = total
                    var discountAmount = 0.0

                    if (promo_code_id != "") {
                        if (pResult.length > 0) {
                            //Promo Code Apply & Valid

                            if (final_total > pResult[0].min_order_amount) {

                                if (pResult[0].type == 2) {
                                    // Fixed Discount
                                    discountAmount = pResult[0].offer_price
                                } else {
                                    //% Per

                                    var disVal = final_total * (pResult[0].offer_price / 100)

                                    helper.Dlog("disVal: " + disVal);

                                    if (pResult[0].max_discount_amount <= disVal) {
                                        //Max discount is more then disVal
                                        discountAmount = pResult[0].max_discount_amount
                                    } else {
                                        //Max discount is Small then disVal
                                        discountAmount = disVal
                                    }
                                }


                            } else {
                                res.json({
                                    'status': "0",
                                    "payload": result,
                                    "total": total.toFixed(2),
                                    "deliver_price_amount": deliver_price_amount.toFixed(2),
                                    "discount_amount": 0,
                                    "user_pay_price": (final_total + deliver_price_amount).toFixed(2),
                                    'message': "Promo Code not apply need min order: $" + pResult[0].min_order_amount
                                })
                                return
                            }

                        } else {
                            //Promo Code Apply not Valid
                            res.json({
                                'status': "0",
                                "payload": result,
                                "total": total.toFixed(2),
                                "deliver_price_amount": deliver_price_amount.toFixed(2),
                                "discount_amount": 0,
                                "user_pay_price": (final_total + deliver_price_amount).toFixed(2),
                                'message': "Invalid Promo Code"
                            })
                            return
                        }
                    }

                    var user_pay_price = final_total + deliver_price_amount + - discountAmount;
                    res.json({
                        "status": "1",
                        "payload": result,
                        "total": total.toFixed(2),
                        "deliver_price_amount": deliver_price_amount.toFixed(2),
                        "discount_amount": discountAmount.toFixed(2),
                        "user_pay_price": user_pay_price.toFixed(2),
                        "message": msg_success
                    })

                })


        })
    })
})

app.post('/api/app/promo_code_list', (req, res) => {
    helper.Dlog(req.body)
    var reqObj = req.body

    checkAccessToken(req.headers, res, (userObj) => {


        db.query("SELECT `promo_code_id`, `code`, `title`, `description`, `type`, `min_order_amount`, `max_discount_amount`, `offer_price`, `start_date`, `end_date`, `created_date`, `modify_date` FROM `promo_code_detail` WHERE `start_date` <= NOW() AND `end_date` >= NOW()  AND `status` = 1 ORDER BY `start_date` ", [], (err, result) => {

            if (err) {
                helper.ThrowHtmlError(err, res)
                return
            }

            res.json({
                'status': '1',
                'payload': result,
                'message': msg_success
            })
        })


    }, "1")
})

app.post('/api/app/order_payment_transaction', (req, res) => {
    helper.Dlog(req.body)
    var reqObj = req.body

    checkAccessToken(req.headers, res, (userObj) => {
        helper.CheckParameterValid(res, reqObj, ["order_id", "payment_transaction_id", "payment_status", "transaction_payload"], () => {
            db.query('INSERT INTO `order_payment_detail`( `order_id`, `transaction_payload`, `payment_transaction_id`, `status`) VALUES ( ?,?,?, ? )', [reqObj.order_id, reqObj.transaction_payload, reqObj.payment_transaction_id, reqObj.payment_status], (err, result) => {
                if (err) {
                    helper.ThrowHtmlError(err, res)
                    return
                }

                if (result) {

                    var message = reqObj.payment_status == "2" ? "successfully" : "fail"

                    db.query("INSERT INTO `notification_detail`( `ref_id`, `user_id`, `title`, `message`, `notification_type`) VALUES (?,?,?, ?,?)", [reqObj.order_id, userObj.user_id,
                    "Order payment " + message, "your order #" + reqObj.order_id + " payment " + message + ".", "2"], (err, iResult) => {
                        if (err) {
                            helper.ThrowHtmlError(err);
                            return
                        }

                        if (iResult) {
                            helper.Dlog("Notification Added Done")
                        } else {
                            helper.Dlog("Notification Fail")
                        }
                    })

                    db.query("UPDATE `order_detail` SET `payment_status`=?,`modify_date`= NOW() WHERE `order_id` = ? AND `user_id` = ? AND `status` = 1", [reqObj.payment_status == "1" ? "2" : "3", reqObj.order_id, userObj.user_id], (err, uResult) => {
                        if (err) {
                            helper.ThrowHtmlError(err);
                            return
                        }

                        if (uResult.affectedRows > 0) {



                            helper.Dlog("order payment status update done")
                        } else {
                            helper.Dlog("order payment status update fail")
                        }
                    })
                    res.json({
                        'status': "1"
                        , 'message': "your order place successfully"
                    })
                } else {
                    res.json({
                        'status': "0"
                        , 'message': msg_fail
                    })
                }
            })
        })
    })
})

app.post('/api/app/notification_list', (req, res) => {
    helper.Dlog(req.body);
    var reqObj = req.body

    checkAccessToken(req.headers, res, (userObj) => {
        db.query("SELECT `notification_id`, `ref_id`, `title`, `message`, `notification_type`, `is_read`, `created_date` FROM `notification_detail` WHERE `user_id` = ? AND `status` = 1", [userObj.user_id], (err, result) => {
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
    }, "1")
})

app.post('/api/app/notification_read_all', (req, res) => {
    helper.Dlog(req.body);
    var reqObj = req.body

    checkAccessToken(req.headers, res, (userObj) => {
        db.query("UPDATE `notification_detail` SET `is_read` = '2', `modify_date` = NOW() WHERE `user_id` = ? AND `status` = 1", [userObj.user_id], (err, result) => {
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
    }, "1")
})

