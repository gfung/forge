/**
 * Functions for manipulating web forms.
 * 
 * @author David I. Lehn <dlehn@digitalbazaar.com>
 * @author Dave Longley
 * @author Mike Johnson
 *
 * Copyright (c) 2011 Digital Bazaar, Inc. All rights reserved.
 */
(function($)
{
   /**
    * The form namespace.
    */
   var form = {};
   
   /**
    * Regex for parsing a single name property (handles array brackets).
    */
   var _regex = /(.*?)\[(.*?)\]/g;
   
   /**
    * Parses a single name property into an array with the name and any
    * array indices.
    * 
    * @param name the name to parse.
    * 
    * @return the array of the name and its array indices in order.
    */
   var _parseName = function(name)
   {
      var rval = [];
      
      var matches;
      while(!!(matches = _regex.exec(name)))
      {
         if(matches[1].length > 0)
         {
            rval.push(matches[1]);
         }
         if(matches.length >= 2)
         {
            rval.push(matches[2]);
         }
      }
      if(rval.length === 0)
      {
         rval.push(name);
      }
      
      return rval;
   };

   /**
    * Adds a field from the given form to the given object.
    * 
    * @param obj the object.
    * @param names the field as an array of object property names.
    * @param value the value of the field.
    * @param dict a dictionary of names to replace.
    */
   var _addField = function(obj, names, value, dict)
   {
      // combine array names that fall within square brackets
      var tmp = [];
      for(var i = 0; i < names.length; ++i)
      {
         var name = names[i];
         if(name.indexOf('[') !== -1)
         {
            for(; ++i < names.length && names[i].indexOf[']'] === -1;)
            {
               name += '.' + names[i];
            }
            if(i < names.length)
            {
               name += '.' + names[i];
            }
         }
         tmp.push(name);
      }
      names = tmp;
      
      // split out array indexes
      var tmp = [];
      $.each(names, function(n, name)
      {
         tmp = tmp.concat(_parseName(name));
      });
      names = tmp;
      
      // iterate over object property names until value is set
      $.each(names, function(n, name)
      {
         // do dictionary name replacement
         if(dict && name.length != 0 && name in dict)
         {
            name = dict[name];
         }
         
         // blank name indicates appending to an array
         if(name.length == 0)
         {
            obj.push(value);
         }
         // value already exists, append value
         else if(obj[name])
         {
            // last name in the field
            if(n == names.length - 1)
            {
               // more than one value, so convert into an array
               if(!$.isArray(obj[name]))
               {
                  obj[name] = [obj[name]];
               }
               obj[name].push(value);               
            }
            // not last name, go deeper into object
            else
            {
               obj = obj[name];
            }
         }
         // new value, last name in the field, set value
         else if(n == names.length - 1)
         {
            obj[name] = value;
         }
         // new value, not last name, go deeper
         else
         {
            // get next name, if blank, then create an array
            var next = names[n + 1];
            if(next.length == 0)
            {
               obj[name] = [];
            }
            // if next name is a number create an array, otherwise a map
            else
            {
               var isNum = ((next - 0) == next && next.length > 0);
               obj[name] = isNum ? [] : {};
            }
            obj = obj[name];
         }
      });
   };
   
   /**
    * Serializes a form to a JSON object. Object properties will be separated
    * using the given separator (defaults to '.') and by square brackets.
    *
    * @param input the jquery form to serialize.
    * @param sep the object-property separator (defaults to '.').
    * @param dict a dictionary of names to replace (name=replace).
    * 
    * @return the JSON-serialized form.
    */
   form.serialize = function(input, sep, dict)
   {
      var rval = {};
      
      // add all fields in the form to the object
      sep = sep || '.';
      $.each(input.serializeArray(), function()
      {
         _addField(rval, this.name.split(sep), this.value || '', dict);
      });
      
      return rval;
   };
   
   /**
    * The forge namespace and form API.
    */
   window.forge = window.forge || {};
   window.forge.form = form;
})(jQuery);
