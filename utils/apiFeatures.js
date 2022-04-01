class APIFeatures {
  //an object is created named 'this' (assume that)...
  //'this' onject contains two properties named -> query and queryString
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    // console.log(this.query);
    return this;
  }
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }

    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
  //now this function is been returned..
}

module.exports = APIFeatures;

// class APIFields {
//   constructor(query, urlQuery) {
//     this.query = query;
//     this.urlQuery = urlQuery;
//   }
//   filter() {
//     const queryObj = { ...this.urlQuery };

//     const elements = ["sort", "limit", "page", "fields"];
//     elements.forEach((e) => delete queryObj[e]); // remove fields...

//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //add dollar signs in the querystrings...

//     this.query = this.query.find(JSON.parse(queryStr));

//     return this;
//   }
//   sort() {
//     if (this.urlQuery.sort) {
//       const sortBy = this.urlQuery.sort.split(",").join(" ");
//       this.query = this.query.sort(sortBy);

//       // const sortBy = this.queryString.sort.split(",").join(" ");
//       // this.query = this.query.sort(sortBy);
//     }
//     return this;
//   }
//   limitFields() {
//     if (this.urlQuery.fields) {
//       const fields = this.urlQuery.fields.split(",").join(" ");
//       this.query = this.query.select(fields);
//     }
//     return this;
//   }
//   paginate() {
//     const limit = this.urlQuery.limit * 1 || 10;
//     const page = this.urlQuery.page * 1 || 1;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);
//     return this;
//   }
// }
// module.exports = APIFields;
