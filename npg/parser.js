#!/usr/bin/env node

// ##EZPAARSE

'use strict';

const Parser = require('../.lib/parser.js');
const doiPrefix = '10.1038';

module.exports = new Parser(function analyseEC(parsedUrl) {
  let result = {};
  let path   = parsedUrl.pathname;
  let match;

  if ((match = /^\/([a-zA-Z0-9]+)\/journal\/v([a-z0-9]+)\/n([0-9]+|current)\/(pdf|full|abs|extref)\/([a-zA-Z0-9\.\-]+)\.[a-z]{2,4}$/.exec(path)) !== null) {
    // http://www.nature.com.gate1.inist.fr/nrm/journal/vaop/ncurrent/full/nrm3940.html
    result.title_id = match[1];
    result.vol      = match[2];
    result.issue    = match[3];
    result.unitid   = result.doi = `${doiPrefix}/${match[5]}`;

    let dashIndex = match[5].search('-');
    if (dashIndex >= 0) {
      result.doi = `${doiPrefix}/${match[5].substr(0, dashIndex)}`;
    }

    if (match[1] !== 'nature' && match[5].startsWith(match[1])) {
      let journal    = match[1];
      let identifier = match[5].substr(journal.length);

      if (identifier.endsWith('a')) {
        identifier = identifier.substr(0, identifier.length - 1);
      }

      if (identifier.match(/^20[0-9]{2}/)) {
        result.publication_date = identifier.substr(0, 4);
        result.doi = `${doiPrefix}/${journal}.${result.publication_date}.${identifier.substr(4)}`;
      }
    }

    switch (match[4].toUpperCase()) {
    case 'ABS':
      result.rtype = 'ABS';
      result.mime  = 'HTML';
      break;
    case 'FULL':
      // http://www.nature.com.gate1.inist.fr/nature/journal/v493/n7431/full/493166a.html
      // http://www.nature.com.gate1.inist.fr/nrm/journal/vaop/ncurrent/full/nrm3940.html
      result.rtype = 'ARTICLE';
      result.mime  = 'HTML';
      break;
    case 'PDF':
    case 'EXTREF':
      // http://www.nature.com.gate1.inist.fr/nature/journal/v493/n7431/pdf/493166a.pdf
      // http://www.nature.com.gate1.inist.fr/cdd/journal/vaop/ncurrent/pdf/cdd2014195a.pdf
      // http://www.nature.com.gate1.inist.fr/nature/journal/v445/n7125/extref/nature05382-s1.pdf
      result.rtype = 'ARTICLE';
      result.mime  = 'PDF';
      break;
    }

  } else if ((match = /\/([a-zA-Z0-9]+)\/(?:knowledgeenvironment\/)?([0-9]+)\/[0-9]+\/[a-zA-Z0-9]+\/(pdf|full)\/([a-zA-Z0-9]+)\.[a-z]{2,4}$/.exec(path)) !== null) {
    // http://www.nature.com.gate1.inist.fr/bonekey/knowledgeenvironment/2012/120613/bonekey2012109/full/bonekey2012109.html
    // http://www.nature.com.gate1.inist.fr/ncomms/2013/130628/ncomms3097/full/ncomms3097.html
    // http://www.nature.com.gate1.inist.fr/bonekey/knowledgeenvironment/2012/120613/bonekey2012109/pdf/bonekey2012109.html
    // http://www.nature.com.gate1.inist.fr/ncomms/2013/130829/ncomms3380/pdf/ncomms3380.pdf

    result.title_id = match[1];
    result.publication_date = match[2];
    result.unitid = result.doi = `${doiPrefix}/${match[4]}`;

    if (match[1] !== 'nature' && match[4].startsWith(match[1])) {
      let journal    = match[1];
      let identifier = match[4].substr(journal.length);

      if (identifier.endsWith('a')) {
        identifier = identifier.substr(0, identifier.length - 1);
      }

      if (identifier.match(/^20[0-9]{2}/)) {
        result.publication_date = identifier.substr(0, 4);
        result.doi = `${doiPrefix}/${journal}.${result.publication_date}.${identifier.substr(4)}`;
      }
    }

    switch (match[3].toUpperCase()) {
    case 'FULL':
      result.rtype = 'ARTICLE';
      result.mime = 'HTML';
      break;
    case 'PDF':
      result.rtype = 'ARTICLE';
      result.mime = 'PDF';
      break;
    }

  } else if ((match = /\/([a-zA-Z0-9]+)\/journal\/v([0-9]*)\/n([a-zA-Z0-9]*)\/index.html/.exec(path)) !== null) {
    // example http://www.nature.com.gate1.inist.fr/nature/journal/v493/n7431/index.html
    result.title_id = match[1];
    result.vol      = match[2];
    result.issue    = match[3];
    result.unitid   = `${match[1]}/v${match[2]}/n${match[3]}`;
    result.rtype    = 'TOC';
    result.mime     = 'MISC';

  } else if ((match = /^\/([a-zA-Z0-9]+)\/(?:archive\/)?(?:index|current_issue)\.html/.exec(path)) !== null) {
    // http://www.nature.com.gate1.inist.fr/nature/index.html
    // http://www.nature.com/clpt/archive/index.html?showyears=2013-2011-#y2011
    // http://www.nature.com.gate1.inist.fr/nature/current_issue.html
    result.unitid   = match[1];
    result.title_id = match[1];
    result.rtype    = 'TOC';
    result.mime     = 'MISC';

  } else if ((match = /\/news\/([^\/]+)/.exec(path)) !== null) {
    // http://www.nature.com/news/work-resumes-on-lethal-flu-strains-1.12266
    result.unitid   = match[1];
    result.title_id = 'nature';
    result.rtype    = 'ARTICLE';
    result.mime     = 'HTML';

  } else if ((match = /\/polopoly_fs\/.+\/([a-zA-Z0-9]+)\.pdf/.exec(path)) !== null) {
    // http://www.nature.com/polopoly_fs/1.12266
    result.unitid   = match[1];
    result.doi      = `${doiPrefix}/${match[1]}`;
    result.title_id = 'nature';
    result.rtype    = 'ARTICLE';
    result.mime     = 'PDF';

  } else if (path === '/siteindex/index.html') {
    // http://www.nature.com.gate1.inist.fr/siteindex/index.html
    result.rtype = 'TOC';
    result.mime  = 'MISC';
  }

  return result;
});
