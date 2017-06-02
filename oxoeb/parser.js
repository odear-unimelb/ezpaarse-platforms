#!/usr/bin/env node

'use strict';
const Parser = require('../.lib/parser.js');

/**
 * Recognizes the accesses to the platform Online Egyptological Bibliography, University of Oxford
 * @param  {Object} parsedUrl an object representing the URL to analyze
 *                            main attributes: pathname, query, hostname
 * @param  {Object} ec        an object representing the EC whose URL is being analyzed
 * @return {Object} the result
 */
module.exports = new Parser(function analyseEC(parsedUrl, ec) {
  let result = {};
  let path   = parsedUrl.pathname;
  // uncomment this line if you need parameters
  let param = parsedUrl.query || {};

  // use console.error for debuging
  // console.error(parsedUrl);

  let match;

  if ((match = /^\/oeb_entry.aspx$/i.exec(path)) !== null) {
    // http://oeb.griffith.ox.ac.uk/oeb_entry.aspx?item=23151
    // http://oeb.griffith.ox.ac.uk/oeb_entry.aspx?parent=239578
    result.rtype    = 'ARTICLE';
    result.mime     = 'HTML';
    let id = param.parent;
    if (id == null){
			id = param.item;
    } 
    result.unitid = id;	

  } 

  return result;
});
