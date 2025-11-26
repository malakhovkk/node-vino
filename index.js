const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();
const client = new OpenAI({
  apiKey: process.env.API_KEY,
});
const app = express();

// const hostname = "194.87.239.231";
// const port = 201;
const hostname = "127.0.0.1";
const port = 8000;
const path = require("path");
app.use(cors());
app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "194.87.238.201",
  database: "vinopark",
  password: "Vinopark2021",
  port: 5432,
});

app.get("/api/1c/products", async (req, res) => {
  try {
    const rows = await pool.query('select * from "1c".products p');
    res.status(200).json(rows.rows);
  } catch (err) {
    res.status(400).json({ message: "Ошибка" });
  }
});
let data;

// try {
//   (async () => {
//     data = await pool.query(
//       `select p.code, p.origname "name", pr.value property from "shop".products p left join "shop".prod2ref pr on pr.uid1_ref=p.uid where p.itype=100 and pr.value<>''`
//     );
//     console.log(data.rows);
//   })();
// } catch (e) {}

app.get("/api/chat-gpt", async (req, res) => {
  console.log(req.query);
  try {
    // const data = await pool.query(
    //   `select p.code, p.origname "name", pr.value property from "shop".products p left join "shop".prod2ref pr on pr.uid1_ref=p.uid where p.itype=100 and pr.value<>''`
    // );
    // console.log(data.rows);
    const response = await client.responses.create({
      model: "gpt-3.5-turbo",
      input: req.query.text,
      // instructions: data.rows,
    });
    res.status(200).json(response.output_text);
    console.log(response.output_tsext);
  } catch (e) {
    res.status(400).json({ message: "Ошибка" });
  }
});

app.get("/api/marks/:uid", async (req, res) => {
  console.log("params.uid", req.params.uid);
  try {
    console.log(
      `Select p.code, p.origname, ic.* from "1c".invoice_codes ic left join  "1c".products p on p.uid=ic.product_uid  where invoice_uid='${req.params.uid}'`
    );
    const rows = await pool.query(
      `Select p.code pcode, p.origname, ic.* from "1c".invoice_codes ic left join  "1c".products p on p.uid=ic.product_uid  where ic.invoice_uid='${req.params.uid}'`
    );
    res.status(200).json(rows.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Ошибка" });
  }
});

app.get("/api/marksDiff/:uid", async (req, res) => {
  console.log("params.uid", req.params.uid);
  try {
    console.log(
      `Select p.code, p.origname, ic.* from "1c".invoice_codes ic left join  "1c".products p on p.uid=ic.product_uid  where invoice_uid='${req.params.uid}'`
    );
    const rows = await pool.query(
      `select i.num, i."date", i.itype, ic.stype, ic.code from "1c".invoice_codes ic left join "1c".invoices i on i.uid=ic.invoice_uid where ic.product_uid ='${req.params.uid}'`
    );
    res.status(200).json(rows.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Ошибка" });
  }
});

app.get("/api/markFind/:code", async (req, res) => {
  console.log("params.code", req.params.code);
  try {
    console.log(
      `select ic.*, p.code  product_code, p.origname, i."date", i.num, i.itype, i.info, i.sign, partners.origname stock_name from "1c".invoice_codes ic left join "1c".invoices i on i.uid=ic.invoice_uid left join "1c".products p on p.uid=ic.product_uid left join "1c".partners partners on partners.uid = i.Stock_uid where ic.code='${req.params.code}' order by i."date"`
    );
    // const rows = await pool.query(
    //   `select ic.*, p.code  product_code, p.origname, i."date", i.num, i.itype, i.info, i.sign  from "1c".invoice_codes ic left join "1c".invoices i on i.uid=ic.invoice_uid left join "1c".products p on p.uid=ic.product_uid where ic.code='${req.params.code}'`
    // );
    const rows = await pool.query(
      `select ic.*, p.code  product_code, p.origname, i."date", i.num, i.itype, i.info, i.sign, partners.name stock_name from "1c".invoice_codes ic left join "1c".invoices i on i.uid=ic.invoice_uid left join "1c".products p on p.uid=ic.product_uid left join "1c".partners partners on partners.uid = i.Stock_uid where ic.code='${req.params.code}' order by i."date"`
    );
    res.status(200).json(rows.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Ошибка" });
  }
});
app.get("/api/1c/products/:id", async (req, res) => {
  console.log("params.id", req.params.id);
  try {
    const rows = await pool.query(
      `select * from "1c".products p where uid='${req.params.id}'`
    );
    res.status(200).json(rows.rows);
  } catch (err) {
    res.status(400).json({ message: "Ошибка" });
  }
});

// const queryWithoutTaxid = (date1, date2) => {
//   return `select p.code, p.name,  p1.code stock_code, p1.name stock_name, (i.sum/100)::float sum_total, i.*, (select sum(ii.quant_rest) quant_rest  from "1c".invoice_items ii where ii.invoice_uid=i.uid) from "1c".invoices i left  join "1c".partners p on p.uid =i.partner_uid left  join "1c".partners p1 on p1.uid =i.stock_uid
//   where
//   (i."date" > '${date1}') and (i."date" < '${date2}')`;
// };

// const FullQuery = (date1, date2, taxid) => {
//   return `select p.code, p.name,  p1.code stock_code, p1.name stock_name, (i.sum/100)::float sum_total, i.*, (select sum(ii.quant_rest) quant_rest  from "1c".invoice_items ii where ii.invoice_uid=i.uid) from "1c".invoices i left  join "1c".partners p on p.uid =i.partner_uid left  join "1c".partners p1 on p1.uid =i.stock_uid
//   where (i."date" > '${date1}') and (i."date" < '${date2}') and p.taxid='${taxid}'`;
// };

// функция список накладных за период
app.get("/api/1c/invoices", async (req, res) => {
  // console.log("params.id", req.params);
  // console.log(req);
  const { date1, date2, taxid, stock_id } = req.query;
  console.log(
    " /api/1c/invoices => taxid=",
    taxid,
    "stock_id=",
    stock_id,
    date1,
    date2
  );
  // console.log(req.body);
  //console.log("aaaaaaaa");
  try {
    if (date1 && date2) {
      console.log(0);
      let query = `select p.code,p.name,p1.code stock_code,p1.name stock_name,(i.sum/100)::float sum_total,pr2.origname group_unit,i.*
           from "1c".invoices i 
           left  join "1c".partners p on p.uid=i.partner_uid 
           left join "1c".partners p1 on p1.uid=i.stock_uid 
           left join "1c".params pr on (pr.uid =i.uid) and (pr.prop_uid='7f6799dd-1a90-11f0-a694-e0071bf85603')
           left join "1c".products pr2 on pr2.uid =pr.value_uid
           where (i."date">'${date1}') and (i."date"<'${date2}')`;
      // if (date1 === "undefined" || date2 === "undefined")
      //   res.status(400).send({ msg: "Ошибка" });
      if (taxid) {
        query += `and p.taxid='${taxid}' `;
      }
      // добавляем фильтр магазин/склад, если stock_id  не пусто
      if (stock_id) {
        query += ` and i.stock_uid='${stock_id}'`;
      }
      // добавляем сортировку по дате накладной
      query += ` order by i."date" desc`;
      const rows = await pool.query(query);
      res.status(200).json(rows.rows);
    } else {
      console.log(1);
      res.status(400).json({ message: "Введите корректные данные" });
    }
  } catch (err) {
    console.log(1);
    console.log(err);
    res.status(400).json({ message: "Ошибка" });
  }
});

app.get("/api/1c/invoices_items", async (req, res) => {
  // console.log("params.id", req.params);
  // console.log(req);
  const { invoice_uid } = req.query;
  // console.log(date1, date2);
  // console.log(req.body);

  try {
    if (invoice_uid && invoice_uid != "undefined") {
      const rows = await pool.query(
        `select ii.uid, ii.invoice_uid, ii.product_uid, p.code, p.origname, p2.origname categ_name,  (ii.sum/100/ii.quant)::float price,  ii.sum/100::float sum, ii.quant, ii.quant_use, ii.quant_rest  
          from "1c".invoice_items ii 
          left join "1c".products p on p.uid=ii.product_uid
          left join "1c".products p2 on p2.uid=p.parent_uid
       where ii.invoice_uid = '${invoice_uid}'`
      );
      return res.status(200).json(rows.rows);
    } else res.status(400).send({ message: "Введите поля верно" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Ошибка" });
  }
});

app.get("/api/1c/revenue2", async (req, res) => {
  // console.log("params.id", req.params);
  // console.log(req);
  const { date1, date2, shopid, group_unit } = req.query;
  console.log(
    "[/api/1c/revenue2] [GET] date1=",
    date1,
    "date1=",
    date2,
    "shopid=",
    shopid,
    "group_unit=",
    group_unit
  );
  // console.log(req.body);
  //console.log(date1, date2);
  try {
    if (date1 && date2) {
      let query = `with sale as 
         (select p.parent_uid, to_char(i."date", 'MM/YYYY'), sum(ii.quant) quant 
           from "1c".invoices i
           left join "1c".invoice_items ii on ii.invoice_uid=i.uid
           left join "1c".products p on p.uid=ii.product_uid
	       left join "1c".invoice_items_bind iib on iib.ref2=ii.uid
           left join "1c".invoice_items ii2 on ii2.uid=iib.ref1
		   left join "1c".invoices i2 on i2.uid=ii2.invoice_uid
		   left join "1c".params pr on (pr.uid=i2.uid) and (pr.prop_uid='7f6799dd-1a90-11f0-a694-e0071bf85603')	  		   
           where (i.itype=3)and(i."date" > '${date1}') and (i."date" < '${date2}')`;
      // добавляем фильтр по "Группа товарного обеспечения"
      if (group_unit) query += `and (pr.value_uid='${group_unit}')`;
      // добавляем фильтр по магазину/складу
      if (shopid) query += ` and(i.stock_uid='${shopid}')`;
      query += `
         group by 1,2
         order by 1,2)
         select p2.origname group_name,p.code, p.origname, s.* from sale s 
         left join "1c".products p on p.uid=s.parent_uid
         left join "1c".products p2 on p2.uid=p.parent_uid`;
      console.log(query);
      const rows = await pool.query(query);
      return res.status(200).json(rows.rows);
    } else res.status(400).send({ message: "Введите поля верно" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Ошибка" });
  }
});

app.get("/api/1c/rest", async (req, res) => {
  // console.log("params.id", req.params);
  // console.log(req);
  const { taxid, stock_uid } = req.query;
  // console.log(date1, date2);
  // console.log(req.body);

  try {
    let query1 = `with
      rest as (select ii.product_uid, max(i."date")::date max_date, min(i."date")::date min_date, sum(ii.quant_use) quant_sale, sum(ii.quant_rest) quant_rest from "1c".invoice_items ii
      left join "1c".invoices i on (i.uid=ii.invoice_uid) left join "1c".partners p1 on (p1.uid=i.partner_uid) where `;
    let query = query1;
    if (taxid) query += `(p1.taxid='${taxid}') `;
    if (stock_uid) query += `and i.stock_uid='${stock_uid}'`;

    let query2 = ` group by ii.product_uid )
      select r.*,  (CURRENT_DATE-r.max_date)::int4 stop_days, pp.price/100::float price, pp1.price/100::float price_sad, pp2.price/100::float price_var,  p.code, p.origname as name, p1.code group_code, p1.origname group_name
      from rest r 
      left join "1c".products p on (p.uid=r.product_uid)
      left join "1c".products p1 on (p1.uid=p.parent_uid)
      left join "1c".product_prices pp on (pp.product_uid=p.uid and pp.price_uid='f210a7ed-d027-11eb-82c9-001d7dd64d88')
      left join "1c".product_prices pp1 on (pp1.product_uid=p.uid and pp1.price_uid='ab261fe0-1bbe-11ee-8bf2-d09466028ae0')
      left join "1c".product_prices pp2 on (pp2.product_uid=p.uid and pp2.price_uid='90eeaa61-bfbb-11eb-82c8-001d7dd64d88')
      where (quant_rest>0)`;
    query += query2;
    console.log(query);
    const rows = await pool.query(query);
    res.status(200).json(rows.rows);
    // console.log(results.rows);

    // } else res.status(400).json({ message: "Не все поля заполнены" });
  } catch (err) {
    console.log(1);
    console.log(err);
    res.status(400).json({ msg: "Ошибка" });
  }
});

// select * from "1c".invoice_items ii left join "1c".products p on p.uid=ii.product_uid
// where ii.invoice_uid = '2a26ab3a-db35-11ef-83d2-2cf05dc8a9ac'
// app.get("/invoices_items", (req, res) => {
//   console.log("params.id", req.params.id);
//   const { uid } = req.body;
//   try {
//     pool.query(
//       `select * from "1c".invoice_items ii left join "1c".products p on p.uid=ii.product_uid
// where ii.invoice_uid ='${uid}'`,
//       (error, results) => {
//         if (error) {
//           throw error;
//         }
//         res.status(200).json(results.rows);
//         console.log(results.rows);
//       }
//     );
//   } catch (err) {
//     console.log(err);
//   }
// });

// app.get("/partners", (req, res) => {
//   // console.log("params.id", req.params.id);
//   // const { uid } = req.body;
//   try {
//     pool.query(
//       `select * from "1c".partners p where p.itype =1`,
//       (error, results) => {
//         if (error) {
//           throw error;
//         }
//         res.status(200).json(results.rows);
//         console.log(results.rows);
//       }
//     );
//   } catch (err) {
//     console.log(err);
//   }
// });

app.get("/api/1c/partners", async (req, res) => {
  // console.log("params.id", req.params.id);
  // const { uid } = req.body;
  try {
    const rows = await pool.query(
      `select distinct taxid, upper("name") from "1c".partners p where (p.itype =1)and not(p.taxid='') group by 1, 2 order by 2`
    );

    res.status(200).json(rows.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Ошибка" });
  }
});

app.get("/api/1c/inv", async (req, res) => {
  const { date1, date2 } = req.query;
  console.log(`select i.uid, "date"::date date, num, sum/100::float sum, stock_uid,
        p.code stock_code, p."name" stock_name from "1c".invoices i left join 
        "1c".partners p on p.uid=i.stock_uid where (i.itype =3) and ("date">='${date1}')
          and ("date"<='${date2}') order by i."date" desc`);
  try {
    if (date1 && date2 && date1 !== "undefined" && date2 !== "undefined") {
      const rows = await pool.query(
        `select i.uid, "date"::date date, num, sum/100::float sum, stock_uid,
        p.code stock_code, p."name" stock_name from "1c".invoices i left join 
        "1c".partners p on p.uid=i.stock_uid where (i.itype =3) and ("date">='${date1}')
          and ("date"<='${date2}') order by i."date" desc`
      );
      res.status(200).send(rows.rows);
    } else res.status(400).json({ message: "Введите корректные данные" });
  } catch (err) {
    res.status(400).json({ message: "Error" });
    console.log(err);
  }
});

app.get("/api/1c/get-content", async (req, res) => {
  const { uid } = req.query;
  try {
    if (uid && uid !== "undefined") {
      const rows = await pool.query(
        `select ps.code, ps.origname, ii.quant, ii.sum/100::float sum_sale, (ii.sum/ii.quant)/100::float price_sale,
        (ii2.sum/ii2.quant)/100::float as price_get, i."date"::date, i.num,
          i.partner_uid, p.code partner_code, p."name" partner_name, pr2.origname group_unit, ii.product_uid

          from "1c".invoice_items ii 
          left join "1c".invoice_items_bind iib on (iib.ref2=ii.uid) 
          left join "1c".invoice_items ii2 on iib.ref1=ii2.uid left join
          "1c".invoices i on i.uid=ii2.invoice_uid 
          left join "1c".partners p on p.uid=i.partner_uid 
          left join "1c".products ps on ps.uid=ii.product_uid 
          left join "1c".params pr on (pr.uid =i.uid) and (pr.prop_uid='7f6799dd-1a90-11f0-a694-e0071bf85603')
          left join "1c".products pr2 on pr2.uid =pr.value_uid
          where ii.invoice_uid='${uid}'`
      );
      res.status(200).json(rows.rows);
    } else {
      res.status(400).json({ message: "Введите корректные данные" });
    }
  } catch (err) {
    res.status(400).json({ message: "Error" });
    console.log(err);
  }
});

app.get("/api/1c/statistics", async (req, res) => {
  const { stock_uid } = req.query;
  //90eeaa40-bfbb-11eb-82c8-001d7dd64d88
  try {
    if (stock_uid) {
      const query = `SELECT date_part('year', i."date" ) AS year, date_part('month', i."date" ) as month , sum(ii.sum/100)::int4 as sum, sum(ii.quant)::int4 as quant FROM "1c".invoices i
    left join "1c".invoice_items ii on ii.invoice_uid =i.uid
    where (i.itype=3) and (i.stock_uid='${stock_uid}')
    group by 1,2
    order by 1,2`;
      const rows = await pool.query(query);
      res.status(200).json(rows.rows);
    } else {
      const query = `SELECT date_part('year', i."date" ) AS year, date_part('month', i."date" ) as month , sum(ii.sum/100)::int4 as sum, sum(ii.quant)::int4 as quant FROM "1c".invoices i
    left join "1c".invoice_items ii on ii.invoice_uid =i.uid
    where (i.itype=3)
    group by 1,2
    order by 1,2`;
      const rows = await pool.query(query);
      res.status(200).json(rows.rows);
    }
  } catch (err) {
    res.status(400).json({ message: "Error" });
    console.log(err);
  }
});

app.get("/api/1c/str", async (req, res) => {
  const { date1, date2, shopid, group_unit } = req.query;
  console.log("[/api/1c/str][GET] shopid=", shopid, "group_unit=", group_unit);
  try {
    let query = `with
      /* приход */
      invoices_plus as
      (select p.parent_uid uid, sum(ii.quant) quant 
	  from "1c".invoices i
      left join "1c".invoice_items ii on ii.invoice_uid=i.uid
      left join "1c".products p on p.uid =ii.product_uid
      left join "1c".params pr on (pr.uid =i.uid) and (pr.prop_uid='7f6799dd-1a90-11f0-a694-e0071bf85603')
      where 
	  (i.itype=0)and(p.parent_uid is not null) and not(p.parent_uid='00000000-0000-0000-0000-000000000000') and 
	  (i."date"<'${date1}') `;
    // добавляем фильтр по "Группа товарного обеспечения"
    if (group_unit) query += `and (pr.value_uid='${group_unit}')`;
    // добавляем фильтр по магазину/складу
    if (shopid) query += `and (i.stock_uid='${shopid}')`;
    query += `group by 1),
      /* расходы старого периода */
      invoices_minus_old as
      ( select p.parent_uid uid, sum(iib.quant) quant 
	  from "1c".invoice_items_bind iib
      left join "1c".invoice_items ii on ii.uid = iib.ref1
      left join "1c".invoice_items ii2 on ii2.uid = iib.ref2
      left join "1c".invoices i on i.uid=ii.invoice_uid
      left join "1c".invoices i2 on i2.uid=ii2.invoice_uid
      left join "1c".products p on p.uid=ii.product_uid
      left join "1c".params pr on (pr.uid =i.uid) and (pr.prop_uid='7f6799dd-1a90-11f0-a694-e0071bf85603')	  
      where 
	  (p.parent_uid is not null)and not(p.parent_uid='00000000-0000-0000-0000-000000000000')
	    and(i."date"<'${date1}') and (i2."date"<'${date1}')`;
    // добавляем фильтр по "Группа товарного обеспечения"
    if (group_unit) query += `and (pr.value_uid='${group_unit}')`;
    // добавляем фильтр по магазину/складу
    if (shopid) query += ` and (i.stock_uid='${shopid}')`;
    query += `
      group by 1),
      /* расходы периода */
      invoices_minus as
      ( select p.parent_uid uid, sum(iib.quant) quant from "1c".invoice_items_bind iib
      left join "1c".invoice_items ii on ii.uid = iib.ref1
      left join "1c".invoice_items ii2 on ii2.uid = iib.ref2
      left join "1c".invoices i on i.uid=ii.invoice_uid
      left join "1c".invoices i2 on i2.uid=ii2.invoice_uid
      left join "1c".products p on p.uid=ii.product_uid
	  left join "1c".params pr on (pr.uid =i.uid) and (pr.prop_uid='7f6799dd-1a90-11f0-a694-e0071bf85603')	  
      where 
	    (p.parent_uid is not null)and not(p.parent_uid='00000000-0000-0000-0000-000000000000')
		and(i."date"<'${date1}')and(i2."date">'${date1}')and(i2."date"<'${date2}')`;
    // добавляем фильтр по "Группа товарного обеспечения"
    if (group_unit) query += `and (pr.value_uid='${group_unit}')`;
    // добавляем фильтр по магазину/складу
    if (shopid) query += ` and (i.stock_uid='${shopid}')`;
    query += `group by 1)
      select ip.uid, p.code,p2.origname group_name,p.origname, (ip.quant-imo.quant) plus, (CASE WHEN im.quant is null THEN 0 ELSE im.quant END) minus, 
      (CASE WHEN ((ip.quant-imo.quant)=0 or im.quant is null) THEN 0 else (im.quant/(ip.quant-imo.quant))*100 END)::float as STR from invoices_plus ip left join invoices_minus_old imo on imo.uid=ip.uid
      left join invoices_minus im on im.uid=ip.uid
      left join "1c".products p on p.uid =ip.uid
      left join "1c".products p2 on p2.uid=p.parent_uid`;
    console.log(query);
    const rows = await pool.query(query);
    res.status(200).json(rows.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "Ошибка" });
  }
});

app.get("/api/1c/group", async (req, res) => {
  try {
    const rows = await pool.query(
      `select uid, origname from "1c".products p where (p.itype=7) and(p.parent_uid='7f6799dd-1a90-11f0-a694-e0071bf85603')`
    );
    res.status(200).json(rows.rows);
  } catch (err) {
    res.status(400).json({ message: "Ошибка" });
  }
});

app.get("/api/1c/payments", async (req, res) => {
  try {
    const { date1, date2, taxid } = req.query;
    let query = `select p.uid, p."date"::date "date", p.num, p.info from "1c".payments p
    left  join "1c".partners pr on pr.uid=p.partner_uid
where (p."date">'${date1}')and(p."date"<'${date2}')`;
    if (taxid) query += `and(pr.taxid='${taxid}')`;
    console.log(query);
    const rows = await pool.query(query);
    res.status(200).json(rows.rows);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Ошибка" });
  }
});

app.get("/api/1c/abc", async (req, res) => {
  try {
    const { date1, date2 } = req.query;
    let query = `with
summ2 as (
select p.parent_uid, sum(ii.quant) quant, sum(ii.sum) sum from "1c".invoice_items ii left join "1c".invoices i on i.uid =ii.invoice_uid
left join "1c".products p on p.uid=ii.product_uid
where i.itype =3 and i."date" >'2024-12-01' and (i."date" >'${date1}') and (i."date" <'${date2}')
group by 1
order by 3 desc)

select p.uid, p.origname, p2.origname, s.*
from summ2 s
left join "1c".products p on p.uid=s.parent_uid
left join "1c".products p2 on p2.uid=p.parent_uid`;
    console.log(query);
    const rows = await pool.query(query);
    let data = [...rows.rows];
    data.sort((a, b) => b.quant - a.quant);
    // console.log(data);
    let sum_quant = 0;
    sum_quant = data.reduce((a, b) => a + b.quant, 0);
    // console.log(sum_quant);
    data = data.map((el) => ({
      ...el,
      quant_per: (el.quant / sum_quant) * 100,
    }));
    // data = data.map((el) => ({
    //   ...el,
    //   quant_per: (el.quant / sum_quant) * 100,
    // }));

    let sum = 0;
    data = data.map(function (el) {
      sum += el.quant_per;
      return {
        ...el,
        cur_quant_per: sum,
      };
    });
    data = data.map(function (el) {
      // sum += el.quant_per;
      let status;
      if (el.cur_quant_per <= 76) status = "A";
      else if (el.cur_quant_per <= 90) status = "B";
      else status = "C";
      return {
        ...el,
        status_quant: status,
      };
    });
    let data2 = [...rows.rows];
    console.log(data2);
    data2 = data2.map((el) => ({ ...el, sum: +el.sum }));
    console.log(data2);
    data2.sort((a, b) => b.sum - a.sum);
    // console.log(data);
    let sum2_quant = 0;
    //sum2_quant = data.reduce((a, b) => a + b.sum, 0);

    data2.forEach((el) => (sum2_quant += el.sum));
    console.log("Сумма = ", sum2_quant);
    // console.log(sum_quant);
    data2 = data2.map((el) => ({
      ...el,
      sum_per: (el.sum / sum2_quant) * 100,
    }));

    // data = data.map((el) => ({
    //   ...el,
    //   quant_per: (el.quant / sum_quant) * 100,
    // }));
    let sum2 = 0;
    data2 = data2.map(function (el) {
      sum2 += el.sum_per;
      return {
        ...el,
        cur_sum_per: sum2,
      };
    });
    data2 = data2.map(function (el) {
      // sum += el.quant_per;
      let status;
      if (el.cur_sum_per <= 76) status = "A";
      else if (el.cur_sum_per <= 90) status = "B";
      else status = "C";
      return {
        ...el,
        status_sum: status,
      };
    });
    const res_arr = rows.rows;

    for (let i = 0; i < res_arr.length; i++) {
      let uid = res_arr[i].uid;
      let status_quant;
      let status_sum;
      for (let j = 0; j < data.length; j++) {
        if (uid === data[j].uid) {
          res_arr[i]["status_quant"] = data[j].status_quant;
        }
      }
      for (let j = 0; j < data2.length; j++) {
        if (uid === data2[j].uid) {
          res_arr[i]["status_sum"] = data2[j].status_sum;
        }
      }
    }
    // console.log(data);
    console.log(data2);
    console.log(res_arr);
    // sum_quant = 0;
    // data.forEach((el) => (sum_quant += el.quant));
    // console.log(sum_quant);
    res.status(200).json(res_arr);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Ошибка" });
  }
});

app.post("/excel-file", async (req, res) => {
  console.log(req.body);
  res.send("Hello");
});

// ****************************************
// Работа с excel
// ****************************************
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function escapeXml(unsafe) {
  return unsafe.toString().replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
    }
  });
}

app.post("/upload", upload.single("filename"), (req, res) => {
  //app.post("/upload", parseData, (req, res) => {
  // req.file - информация о файле
  // req.body - текстовые поля формы
  console.log("[POST] /upload", req.body);
  console.log("num", req.body.num);

  const ExcelJS = require("exceljs");
  const wb = new ExcelJS.Workbook();

  var dataFile = req.file.buffer;
  const extension =
    req.file.originalname.split(".")[
      req.file.originalname.split(".").length - 1
    ];

  if (
    extension !== "xlsx" &&
    extension !== "xlsm" &&
    extension !== "xlsb" &&
    extension !== "xltx" &&
    extension !== "xltm" &&
    extension !== "xls" &&
    extension !== "xlt" &&
    extension !== "xml" &&
    extension !== "xlam" &&
    extension !== "xla" &&
    extension !== "xlw" &&
    extension !== "xlr"
  ) {
    return res.status(400).json({ message: "Не тот формат" });
  }
  // это mimetype= application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  // для базового excel с расширением xlsx
  // если не так, то запускаем преобразование буфера содержащего данные файла в xlsx
  if (
    req.file.mimetype !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    //if (req.file.mimetype == "application/vnd.ms-excel") {
    // Requiring the module
    const reader = require("xlsx");
    // Reading our test file
    //const file = reader.readFile(req.file.path.split("\\")[0] + "/" + req.file.path.split("\\")[1]);
    const file = reader.read(dataFile);
    fn = "uploads/test3.xlsx";
    const workBookOptions = {
      bookType: "xlsx",
      bookSST: false,
      type: "binary",
    };
    dataFile = reader.writeXLSX(file, workBookOptions);
  }

  // загрузка буфера файла типа  xlsx и обработка
  wb.xlsx
    //.readFile(fn, { ignoreNodes: ["mergeCells"] })
    .load(dataFile, { ignoreNodes: ["mergeCells"] })
    .then(() => {
      const ws1 = wb.worksheets[req.body.num];
      //const ws1 = wb.getWorksheet(wb.worksheets[req.body.num].name);

      console.log(
        wb.category,
        wb.company,
        wb.creator,
        wb.description,
        wb.keywords,
        "lastModifiedBy=",
        wb.lastModifiedBy,
        "created=",
        wb.created,
        wb.manager,
        "modified=",
        wb.modified,
        wb.lastPrinted,
        wb.properties,
        wb.subject,
        wb.title
      );
      let str_val = `<?xml version="1.0" encoding="UTF-8"?>
          <pricelist filename="${req.file.originalname}" worksheets="${
        wb.worksheets[req.body.num].name
      }" rows="${ws1.rowCount}" columns="${
        ws1.columnCount
      }" created="${wb.created.toISOString()}" modified="${wb.modified.toISOString()}">`;
      // Iterate over all rows that have values in a worksheet
      ws1.eachRow({ includeEmpty: true }, function (row, rowNumber) {
        if (row) {
          //console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
          // Iterate over all cells in a row (including empty cells)
          str_val += `<row idx="${rowNumber}">`;
          row.eachCell({ includeEmpty: false }, function (cell, colNumber) {
            if (cell) {
              //console.log("Cell " + colNumber + " = " + cell.value);
              if (cell.effectiveType && cell.value.hyperlink) {
                str_val += `<col${colNumber} href="${escapeXml(
                  cell.value.hyperlink
                )}" vType="${cell.effectiveType}">${escapeXml(
                  cell.text
                )}</col${colNumber}>`;
              } else {
                if (cell.effectiveType) {
                  str_val += `<col${colNumber}  vType="${
                    cell.effectiveType
                  }">${escapeXml(cell.text)}</col${colNumber}>`;
                } else {
                  str_val += `<col${colNumber}>${escapeXml(
                    cell.text
                  )}</col${colNumber}>`;
                }
              }
            }
          });
          str_val += "</row>";
        }
      });
      str_val += "</pricelist>";
      res.send(str_val);
    })
    .catch((err) => {
      res.status(400);
      res.send(err.message);
      console.log(err.message);
    });
});
// const mongoose = require("mongoose");
// // Подключение к MongoDB
// mongoose.connect("mongodb://localhost:27017/todo-app", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// Создание схемы и модели для задач
// const vcardSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   middleName: { type: String, required: true },
//   email: { type: String, required: true },
//   cellphone: { type: String, required: true },
//   photo: { type: String, required: true },
//   // completed: { type: Boolean, default: false },
// });
var fs = require("fs/promises");
// const Vcard = mongoose.model("vcardNew", vcardSchema);
let vCardsJS = require("vcards-js");
// const MyVCard = require("vcard-creator");
// (async () => {
//   await pool.query(`DROP TABLE VCards; CREATE TABLE VCards(
//     PersonID SERIAL PRIMARY KEY,
//     lastname varchar(255),
//     firstname varchar(255),
//     middlename varchar(255),
//     lastname_en varchar(255),
//     firstname_en varchar(255),
//     middlename_en varchar(255),
//     email varchar(255),
//     cellphone varchar(255),
//     photo varchar(255),
//     organization varchar(255),
//     position varchar(255),
//     position_en varchar(255),
//     )`);
//   // })();
// })();
app.get("/api/vcard-get", async (req, res) => {
  console.log(req.query);
  try {
    const card = await Vcard.findById(req.query.id);
    // const vcardString = card.getOutput();
    // fs.writeFileSync("contact.vcf", vcardString);

    // This is your vCard instance, that
    // represents a single contact file
    let vCard = vCardsJS();

    // Set contact properties
    // vCard.firstName = card.firstName;
    // vCard.middleName = card.middleName;
    // vCard.lastName = card.lastName;
    // vCard.organization = card.organization;
    // vCard.title = card.title;
    // vCard.email = card.email;
    // vCard.cellPhone = card.cellPhone;
    console.log(card);
    const str =
      `BEGIN:VCARD\n` +
      `VERSION:2.1\n` +
      `TZ:+03:00\n` +
      `CLASS:PUBLIC\n` +
      `FN:${card.firstName} ${card.middleName} ${card.lastName}\n` +
      `N:${card.lastName};${card.firstName};${card.middleName};;\n` +
      `ORG:${card.organization}\n` +
      `TEL;WORK;VOICE:${card.cellphone}\n` +
      `TEL;HOME;VOICE:${`8916`}\n` +
      `EMAIL:${card.email}\n` +
      `PHOTO;JPG;ENCODING=BASE64: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\n` +
      `URL;TYPE;VK:https://vk.com/degs555\n` +
      `URL;TYPE;instagram:https://instagram.com/malakhovkk\n` +
      `ADR;CHARSET=utf-8;work:;;Садовая-Спасская дом 17/2;Москва;Москва;107078;Россия\n` +
      `ADR;CHARSET=utf-8;work:;;Варшавское шоссе дом 18 корпус 1;Москва;Москва;117105;Россия\n` +
      `END:VCARD\n`;
    await fs.writeFile("file.vcf", str);
    // Save contact to VCF file
    // vCard.saveToFile(`file.vcf`);

    const filePath = __dirname + "/file.vcf";
    res.sendFile(filePath);
    // res.status(200).json(card);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
  // res.send({ ok: true });
});

app.get("/api/vcard", async (req, res) => {
  try {
    // const vcards = await Vcard.find();
    const vcards = await pool.query(
      "SELECT * FROM vCards WHERE enabled = 1 ORDER BY Personid"
    );
    res.send(vcards);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});
(async () => {
  await pool.query(`CREATE TABLE if not exists staff(
    PersonID SERIAL PRIMARY KEY,
    lastname varchar(255),
    firstname varchar(255),
    middlename varchar(255),
    datefrom date
)`);
})();
//CREATE INDEX idx_schedule_shop ON schedule(shopID);
(async () => {
  await pool.query(`CREATE TABLE if not exists schedule(
    ID SERIAL PRIMARY KEY,
    PersonID int,
    shopID UUID,
    wd1 timestamp,
    wd2 timestamp,
    type int
)`);
})();

(async () => {
  await pool.query(`CREATE TABLE if not exists points(
    ID SERIAL PRIMARY KEY,
    name varchar(255),
    points int
)`);
})();

(async () => {
  await pool.query(`CREATE TABLE if not exists staff_points(
    ID SERIAL PRIMARY KEY,
    personId int,
    pointsId int,
    shift timestamp,
    points int
)`);
})();

// (async () => {
//   await pool.query(`
// UPDATE vCards SET enabled = 1`);
// })();

function base64_encode(file) {
  // read binary data
  var bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString("base64");
}

app.get("/api/vcard/get/:id", async (req, res) => {
  try {
    let lang = req.query.lang;
    if (!lang) lang = "ru";
    console.log(lang);
    let card = await pool.query("SELECT * FROM vCards WHERE PersonID=$1", [
      req.params.id,
    ]);
    if (card.rows.length === 0) {
      return res.status(404).send("Card not found");
    }

    card = card.rows[0];
    console.log(card);

    let base64Image;
    let data;
    if (card.photo !== "undefined") {
      try {
        data = await fs.readFile("uploads-photo/" + card.photo);
      } catch (err) {
        console.log("err ", err);
      }
      if (data) base64Image = Buffer.from(data, "binary").toString("base64");
    }

    let data2 = await fs.readFile("vinopark.png");
    let base64Image2 = Buffer.from(data2, "binary").toString("base64");

    // console.log(base64Image2);
    let str = `BEGIN:VCARD\n` + `VERSION:2.1\n`;
    if (card.photo !== "undefined" && base64Image)
      str +=
        `PHOTO;` +
        card.photo.split(".")[card.photo.split(".").length - 1].toUpperCase() +
        `;ENCODING=BASE64:${base64Image}\n`;

    str += `TZ:+03:00\n` + `CLASS:PUBLIC\n`;
    if (lang === "ru")
      str += `FN;CHARSET=utf-8:${card.firstname} ${card.middlename} ${card.lastname}\n`;
    else
      str += `FN;CHARSET=utf-8:${card.firstname_en} ${card.middlename_en} ${card.lastname_en}\n`;
    if (lang === "ru")
      str += `N;CHARSET=utf-8:${card.lastname};${card.firstname};${card.middlename};;\n`;
    else
      str += `N;CHARSET=utf-8:${card.lastname_en};${card.firstname_en};${card.middlename_en};;\n`;
    // ORG:${card.organization}\n + // Раскомментируйте, если нужно
    str += `TEL;WORK;VOICE:${card.cellphone}\n`;
    if (lang === "ru") str += `TITLE;CHARSET=utf-8:${card.position}\n`;
    else str += `TITLE;CHARSET=utf-8:${card.position_en}\n`;
    str += `ORG;CHARSET=utf-8:${card.organization}\n`;
    // `TEL;HOME;VOICE:8916\n` +
    if (lang === "ru")
      str +=
        `ADR;CHARSET=utf-8;work:;;Садовая-Спасская дом 17/2;Москва;;107078;Россия\n` +
        // Садовая-Спасская дом 17/2;Москва;;107078;Россия
        `ADR;CHARSET=utf-8;work:;;Варшавское шоссе дом 18 корпус 1;Москва;;117105;Россия\n`;
    else
      str +=
        `ADR;CHARSET=utf-8;work:;;Sadovaya Spaskaya 17/2;Moscow;;107078;Russia\n` +
        // Садовая-Спасская дом 17/2;Москва;;107078;Россия
        `ADR;CHARSET=utf-8;work:;;Varshavskoye Highway, 18 building 1;Moscow;;117105;Russia\n`;
    str +=
      `LOGO;ENCODING=b;TYPE=PNG:${base64Image2}\n` +
      `EMAIL;CHARSET=utf-8;INTERNET:${card.email}\n` +
      // +`LOGO;ENCODING=b;TYPE=PNG:12\n`+
      `END:VCARD\n`;

    console.log(str);
    // console.log(base)
    await fs.writeFile("file.vcf", str);

    const filePath = __dirname + "/file.vcf";
    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(400).send("Internal Server Error");
  }
});

// const multer = require('multer');
const { randomUUID, secureHeapUsed } = require("crypto");

const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads-photo/"); // Папка для сохранения загруженных файлов
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(
      null,
      randomUUID() +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    ); // Переименовываем файл
  },
});
const upload2 = multer({ storage: storage2 });
const dir = "./uploads-photo";
const fs2 = require("fs");
if (!fs2.existsSync(dir)) {
  fs2.mkdirSync(dir);
}

app.get("/api/staff", async (req, res) => {
  try {
    const data = await pool.query("SELECT * FROM staff ORDER BY personid");
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.delete("/api/staff/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await pool.query(`DELETE FROM staff WHERE PersonID=${id}`);
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.put("/api/staff", async (req, res) => {
  console.log(req.body);
  try {
    await pool.query(
      `UPDATE staff SET lastname = '${req.body.lastname}', firstname='${req.body.firstname}', middlename='${req.body.middlename}', datefrom='${req.body.datefrom}' WHERE PersonID=${req.body.personid}`
    );
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/api/schedule", async (req, res) => {
  try {
    const data = await pool.query("SELECT * FROM schedule ORDER BY ID");
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/api/schedule/:shopid", async (req, res) => {
  try {
    const shopid = req.params.shopid;
    const data = await pool.query(
      `SELECT * FROM schedule WHERE shopId = '${shopid}' ORDER BY ID`
    );
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.delete("/api/schedule/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await pool.query(`DELETE FROM schedule WHERE id=${id}`);
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.post("/api/schedule", async (req, res) => {
  console.log(req.body);
  try {
    await pool.query(
      `INSERT INTO schedule(personId, wd1, wd2, type, shopId) VALUES('${req.body.personid}', '${req.body.wd1}', '${req.body.wd2}', '${req.body.type}', '${req.body.shop}')`
    );
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.put("/api/schedule", async (req, res) => {
  console.log(req.body);
  try {
    await pool.query(
      `UPDATE schedule SET personId='${req.body.personid}', wd1='${req.body.wd1}', wd2='${req.body.wd2}', type='${req.body.type}' WHERE id='${req.body.id}'`
    );
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/api/points", async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM points ORDER BY ID`);
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.post("/api/points", async (req, res) => {
  console.log(req.body);
  try {
    await pool.query(
      `INSERT INTO points(name, points) VALUES('${req.body.name}', '${req.body.points}')`
    );
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.put("/api/points", async (req, res) => {
  console.log(req.body);
  try {
    await pool.query(
      `UPDATE points SET name = '${req.body.name}', points = '${req.body.points}' WHERE ID = '${req.body.id}'`
    );
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.delete("/api/points/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await pool.query(`DELETE FROM points WHERE ID = ${id} `);
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.post("/api/staff_points", async (req, res) => {
  console.log(req.body);
  try {
    console.log(
      `INSERT INTO staff_points(personId, pointsId, shift, points) VALUES('${req.body.personid}','${req.body.event},'${req.body.shift}','${req.body.points}')`
    );
    const data = await pool.query(
      `INSERT INTO staff_points(personId, pointsId, shift, points) VALUES('${req.body.personid}','${req.body.event}','${req.body.shift}','${req.body.points}')`
    );

    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/api/staff_points", async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM staff_points ORDER BY ID`);
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/api/staff_points/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await pool.query(
      `SELECT * FROM staff_points WHERE personId = ${id} ORDER BY ID`
    );
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.delete("/api/staff_points/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = await pool.query(`DELETE FROM staff_points WHERE ID = ${id} `);
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.post("/api/staff", async (req, res) => {
  console.log(req.body);
  try {
    await pool.query(
      `INSERT INTO staff(lastname, firstname, middlename, datefrom) VALUES('${req.body.lastname}', '${req.body.firstname}', '${req.body.middlename}', '${req.body.datefrom}')`
    );
    res.json({ ok: true });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.put("/api/vcard", upload2.single("photo"), async (req, res) => {
  try {
    let str = "";
    let input;
    if (req.file) input = { ...req.body, photo: req.file.filename };
    else input = { ...req.body, photo: "undefined" };
    for (let key in input) {
      if (key !== "personid") {
        str = str + `${key} = '${input[key]}',`;
      }
    }
    str = str.slice(0, -1);
    const query =
      "UPDATE vCards SET " + str + " WHERE Personid=" + input.personid;
    console.log(query);
    await pool.query(query);
    res.status(200).send({ ok: true });
  } catch (err) {
    res.status(400).send(err);
  }
});
app.post("/api/vcard", upload2.single("photo"), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file);
    if (req.file) input = { ...req.body, photo: req.file.filename };
    else input = { ...req.body };
    let str = "INSERT INTO vCards (";
    for (let key in input) {
      str = str + key + ",";
    }
    str = str.slice(0, -1);

    str = str + ") VALUES (";
    for (let key in input) {
      str = str + `'` + input[key] + `'` + ",";
    }
    str = str.slice(0, -1);
    str = str + ")";
    console.log(str);
    const res2 = await pool.query(str);
    console.log(str);
    console.log(res);
    // const card = new Vcard({...req.body, photo:req.file.filename});
    res.status(201).send();

    // await card.save();
  } catch (err) {
    console.log("AAA ", err);
    res.status(400).send(err);
  }
  // res.send({ ok: true });
});

app.delete("/api/vcard", async (req, res) => {
  console.log(req.body);
  const id = req.body.personid;
  try {
    pool.query(`UPDATE vCards SET enabled = 0 WHERE personid=${id}`);
    res.status(200).send({ ok: true });
  } catch (err) {
    res.status(400).send(err);
  }
});
// const fs2 = require("fs");
function imageToBase64(imagePath) {
  return new Promise((resolve, reject) => {
    console.log("A");
    fs2.readFile(imagePath, (err, data) => {
      console.log(0);
      if (err) {
        return reject(err);
      }
      // Преобразуем в Base64
      console.log(1);
      const base64Image = Buffer.from(data).toString("base64");
      console.log(2);
      resolve(base64Image);
    });
  });
}

app.get("/api/html/:lang/:id", async (req, res) => {
  console.log(req.body);
  const id = req.params.id;
  const lang = req.params.lang;
  console.log(lang);
  try {
    const data = pool.query("SELECT * FROM vCards WHERE Personid=" + id);
    console.log((await data).rows);
    const rows = (await data).rows[0];
    if (!rows) res.status(400).send({ err: "Not valid id" });
    const imagePath = path.join(__dirname, "uploads-photo", rows["photo"]);
    delete rows["photo"];
    const base64 = await imageToBase64(imagePath);
    const r = Object.keys(rows).map((row) => `<th>${row}</th>`);
    const res2 = r.join("");
    if (lang === "ru") {
      const html = `<html>
    <head>
    <style>
    html
    {
    font-family: "Helvetica";
    background-color: #f5f5f5;;
    }
table {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #ddd;
  padding: 8px;
}

tr:nth-child(even){background-color: #f2f2f2;}

tr:hover {background-color: #ddd;}

th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #04AA6D;
  color: white;
}
.main
{
  width: 900px;
  margin: 0 auto;
}
  .content
   {
      background-color: white;
      border-radius: 10px;
      width:400px;
      margin: 10px auto;
          padding: 10px 0px 10px;
    }
    .content__title
    {
      font-size: 16px;
      width: 80px;
      text-aligh: left;
    }
    content__value
    {
      font_size: 14px;
      color: #2540cf;
    }
    .list
    {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 30px;
      border-bottom: 1px solid #dadada;
      padding:10px;
      width: 300px;
    }
      .upper
      {
      text-align: center;
      }
</style>
    </head>
    <body>
    <div class="main">
    <div class="upper">
    <img style="width:200px;height: 200px; border-radius: 100px; object-fit: cover;" src="data:image/${imagePath
      .split(".")
      [
        imagePath.split(".").length - 1
      ].toUpperCase()};base64, ${base64}" alt="Аватарка" />
      <h1>${rows.lastname} ${rows.firstname} ${rows.middlename}</h1>
      
      </div>
    <div class="info">
      <div class="content">
        <ul class="container">
        <li class="list">
          <a class="content__title" >Организация</a>
          <a class="content__value" href="http://vinopark.ru" target="_blank">${
            rows.organization
          }</a>
        </li>
        <li class="list">
          <a class="content__title">Должность</a>
          <a class="content__value">${rows.position}</a>
        </li>
        <li class="list">
          <a class="content__title">Email </a>
          <a class="content__value" href="mailto:${rows.email}">${
        rows.email
      }</a>
        </li>
        <li class="list">
          <a class="content__title">Телефон</a>
          <a class="content__value" href="tel:${rows.cellphone}">${
        rows.cellphone
      }</a>
        </li>
         
      </div>
    </div>

    </div>
    </body>
    </html>
    `;
      res.status(200).send(html);
    } else if (lang === "en") {
      const html = `<html>
    <head>
    <style>
    html
    {
    font-family: "Helvetica";
    background-color: #f5f5f5;;
    }
table {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #ddd;
  padding: 8px;
}

tr:nth-child(even){background-color: #f2f2f2;}

tr:hover {background-color: #ddd;}

th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  background-color: #04AA6D;
  color: white;
}
.main
{
  width: 900px;
  margin: 0 auto;
}
  .content
   {
      background-color: white;
      border-radius: 10px;
      width:400px;
      margin: 10px auto;
          padding: 10px 0px 10px;
    }
    .content__title
    {
      font-size: 16px;
      width: 80px;
      text-aligh: left;
    }
    content__value
    {
      font_size: 14px;
      color: #2540cf;
    }
    .list
    {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 30px;
      border-bottom: 1px solid #dadada;
      padding:10px;
      width: 300px;
    }
      .upper
      {
      text-align: center;
      }
</style>
    </head>
    <body>
    <div class="main">
    <div class="upper">
    <img style="width:200px;height: 200px; border-radius: 100px; object-fit: cover;" src="data:image/${imagePath
      .split(".")
      [
        imagePath.split(".").length - 1
      ].toUpperCase()};base64, ${base64}" alt="Аватарка" />
      <h1>${rows.lastname_en} ${rows.firstname_en} ${rows.middlename_en}</h1>
      

      </div>
    <div class="info">
      <div class="content">
        <ul class="container">
        <li class="list">
          <a class="content__title">Organization</a>
          <a class="content__value" href="http://vinopark.ru" target="_blank">${
            rows.organization
          }</a>
        </li>
        <li class="list">
          <a class="content__title">Position</a>
          <a class="content__value">${rows.position_en}</a>
        </li>
        <li class="list">
          <a class="content__title">Email</a>
          <a class="content__value" href="mailto:${rows.email}">${
        rows.email
      }</a>
        </li>
        <li class="list">
          <a class="content__title">Phone</a>
          <a class="content__value" href="tel:${rows.cellphone}">${
        rows.cellphone
      }</a>
        </li>
         
      </div>
    </div>

    </div>
    </body>
    </html>
    `;
      res.status(200).send(html);
    } else res.status(400).send({ err: "Choose valid language" });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/api/cardView", async (req, res) => {
  try {
    const data =
      await pool.query(`select p1.uid group_uid,p1.code group_code, p1.origname group_name, p.*  from "1c".products p left join "1c".products p1 on p1.uid=p.parent_uid and p1.itype=5 where p.itype=0 and p1.uid is not null
`);
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/api/cardViewGroup", async (req, res) => {
  try {
    const data = await pool.query(
      `select p.* from "1c".products p  where p.itype=5`
    );
    res.send(data.rows);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

app.get("/photo/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads-photo", req.params.filename);
  res.sendFile(filePath);
});

// *****************************************************
process.on("uncaughtException", function (err) {
  console.log("Caught exception: ", err);
});
app.listen(port, hostname, () => {
  console.log(`Server.Node --  API 1C running at http://${hostname}:${port}/`);
});

const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

// Middleware

// Подключение к MongoDB
mongoose
  .connect("mongodb://194.87.239.231:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error(err);
    console.log("ERROR");
  });

const AuthorSchema = new mongoose.Schema({
  author: String,
  name: String,
});

// Определите схему и модель
const ChatSchema = new mongoose.Schema({
  author: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const StatisticsSchema = new mongoose.Schema({
  author: String,
  lastMessageDate: Date,
});

const Chat = mongoose.model("Chat", ChatSchema);
const Author = mongoose.model("Author", AuthorSchema);
const Statistics = mongoose.model("Statistics", StatisticsSchema);

function subtractDays(date, days) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}
// app.get("/messages", async (req, res) => {
//   try {
//     const n = 10;

//     const startOfDay = new Date();
//     startOfDay.setHours(0, 0, 0, 0); // Устанавливаем время на начало дня

//     const endOfDay = subtractDays(startOfDay, n);
//     console.log(req.query);
//     let messages;
//     let date;
//     if (!req?.query?.date) {
//       console.log("11", req.query);
//       const last = await Statistics.findOne({}, { lastMessageDate: 1 })
//         .sort({ lastMessageDate: -1 })
//         .lean();

//       const lastDate = last?.lastMessageDate;

//       date = new Date(lastDate);
//       date.setHours(0, 0, 0, 0);
//       messages = await Chat.find({
//         createdAt: {
//           $gte: date,
//         },
//       }).sort({
//         createdAt: 1,
//       });
//     } else {
//       console.log("22", req.query);
//       let d = new Date(req.query.date);
//       d.setHours(23, 59, 59, 999);

//       // let dateOnly = new Date(
//       //             Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
//       //           );
//       // let secondDate = new Date(req.query.date);
//       // secondDate.setHours(23, 59, 59, 999)
//       // secondDate = subtractDays(secondDate, 1);
//       // secondDate = new Date(
//       //             Date.UTC(secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate())
//       //           );
//       const res = await Chat.find({
//         createdAt: {
//           $lte: d,
//         },
//       }).sort({
//         createdAt: 1,
//       });
//       console.log(d);
//       const fd = new Date(res[0].createdAt ?? "");
//       fd.setHours(0, 0, 0, 0);

//       let secondDate = new Date(res[0].createdAt);
//       secondDate.setHours(23, 59, 59, 999);
//       console.log(fd, secondDate);
//       messages = await Chat.find({
//         createdAt: {
//           $lte: secondDate,
//           $gte: fd,
//         },
//       }).sort({
//         createdAt: 1,
//       });
//       console.log(res[0].createdAt);
//     }
//     messages = await Promise.all(
//       messages.map(async (m) => {
//         const author = await Author.findOne({ author: m.author });
//         // console.log("mmmmmm", m);
//         return {
//           _id: m._id,
//           author: m.author,
//           message: m.message,
//           name: author?.name || null,
//           date: m.createdAt,
//         };
//       })
//     );
//     res.json(messages);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: true });
//   }
// });

app.get("/messages", async (req, res) => {
  console.log("[START]");
  try {
    let messages;
    let fromDate;
    let toDate;

    console.log(req.query);
    // --- Если дата НЕ передана — берем последний день из Statistics ---
    if (!req?.query?.date) {
      const last = await Statistics.findOne({}, { lastMessageDate: 1 })
        .sort({ lastMessageDate: -1 })
        .lean();

      const lastDate = last?.lastMessageDate;
      console.log(lastDate);
      if (!lastDate) return res.json([]);

      fromDate = new Date(lastDate);
      fromDate.setHours(0, 0, 0, 0);

      messages = await Chat.find({
        createdAt: { $gte: fromDate },
      }).sort({ createdAt: 1 });
      console.log(messages);
    } else {
      // --- Если дата передана ---
      let d = new Date(req.query.date);
      d = subtractDays(d, 1);
      d.setHours(23, 59, 59, 999);
      console.log(d);
      // находим все сообщения до конца указанной даты
      const found = await Chat.find({
        createdAt: { $lte: d },
      }).sort({ createdAt: -1 }); // сортируем по убыванию, чтобы взять самое последнее сообщение до d

      if (!found.length) return res.json([]);

      // earliest message of that day:
      const dayMsg = new Date(found[0].createdAt);
      fromDate = new Date(dayMsg);
      fromDate.setHours(0, 0, 0, 0);

      toDate = new Date(dayMsg);
      toDate.setHours(23, 59, 59, 999);

      messages = await Chat.find({
        createdAt: { $gte: fromDate, $lte: toDate },
      }).sort({ createdAt: 1 });
    }

    // --- Подгрузка авторов ---
    messages = await Promise.all(
      messages.map(async (m) => {
        const author = await Author.findOne({ author: m.author });
        return {
          _id: m._id,
          author: m.author,
          message: m.message,
          name: author?.name ?? null,
          date: m.createdAt,
        };
      })
    );

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true });
  } finally {
    console.log("[END]");
  }
});

// Отправка сообщения
app.post("/messages", async (req, res) => {
  try {
    // res.json({ ok: true });
    console.log(req.body);
    const date = Date.now();
    const newMessage = new Chat({
      message: req.body.text,
      author: req.body.author,
      createdAt: date,
    });

    const result = await Statistics.updateOne(
      { author: req.body.author },
      {
        $set: { lastMessageDate: date },
      },
      { upsert: true }
    );
    console.log(result);
    await newMessage.save();
    res.json(newMessage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.post("/author", async (req, res) => {
  try {
    const authors = await Author.find({ name: req.body.name });
    console.log("1", authors);
    if (!authors.length) {
      const newAuthor = new Author({
        name: req.body.name,
        author: req.body.author,
      });
      await newAuthor.save();
      res.json(newAuthor);
    } else {
      console.log(2);
      res.json(authors);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

// Long Polling для получения новых сообщений
app.get("/poll", async (req, res) => {
  try {
    const lastMessageId = req.query.lastMessageId;
    const pollMessages = async () => {
      let messages = await Chat.find().sort({ createdAt: 1 });
      messages = await Promise.all(
        messages.map(async (m) => {
          const author = await Author.findOne({ author: m.author });
          // console.log("poll", m);
          return {
            _id: m._id,
            author: m.author,
            message: m.message,
            name: author?.name || null,
            date: m.createdAt,
          };
        })
      );
      const newMessages = messages.filter((msg) => msg._id > lastMessageId);
      if (newMessages.length > 0) {
        return res.json(newMessages);
      }
      setTimeout(pollMessages, 1000); // Проверяем каждые 1 секунду
    };
    pollMessages();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});

app.get("/getIdByName", async (req, res) => {
  try {
    console.log(req.query);
    const name = req.query.name;
    const authors = await Author.find({ name });
    console.log("author=", authors);
    res.json(authors);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: true });
  }
});
