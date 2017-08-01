(function (m) {
'use strict';

m = m && m.hasOwnProperty('default') ? m['default'] : m;

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

function getType(x) {
	var currentType = toStr.call(x).slice(8, -1).toLowerCase();
	if (currentType === 'array' && x.length > 0) {
		return '[array of ' + getType(x[0]) + 's]';
	}
	return currentType;
}

function typeStringFromArray(arr) {
	if (arr.length === 1) {
		return arr[0].type;
	}
	return arr.map(function(typeCheckFn) {
		return typeCheckFn.type;
	}).join(' || ');
}

function T(schema) {

	return function(props, label) {

		if (T.disabled) { return; }

		var loop = function ( key ) {

			if (hasOwn.call(schema, key)) {

				var rules = Array.isArray(schema[key]) ? schema[key] : [schema[key]];
				var success = rules.reduce(function(prev, rule) {
					return prev || rule(props[key], label);
				}, false);

				if (!success) {

					var errorMessage =
						'Failed type check in ' + (label || 'unknown object') + '\n' +
						'Expected prop \'' + key + '\' of type ' + typeStringFromArray(rules) + '\n' +
						'You provided \'' + key + '\' of type ' + getType(props[key]);

					if (T.throws) {
						throw new TypeError(errorMessage);
					}

					// recursive call will report errors in next round of checks
					if (typeStringFromArray(rules).indexOf('interface') > -1) {
						return;
					}

					console.error(errorMessage);
					return { v: errorMessage };
				}
			
			}

		};

		for (var key in schema) {
			var returned = loop( key );

			if ( returned ) return returned.v;
		}

		for (var key$1 in props) {
			if (hasOwn.call(props, key$1) && !hasOwn.call(schema, key$1)) {
				var errorMessage$1 = 'Did not expect to find prop \'' + key$1 + '\' in ' + label;
				console.error(errorMessage$1);
				return errorMessage$1;
			}
		}

		return null;

	};

}

T.fn = T['function'] = function(x) {
	return typeof x === 'function';
};

T.fn.type = 'function';

T.str = T.string = function(x) {
	return typeof x === 'string';
};

T.str.type = 'string';

T.num = T.number = function(x) {
	return typeof x === 'number';
};

T.num.type = 'number';

T.date = function(x) {
	return getType(x) === 'date';
};

T.date.type = 'date';

T.NULL = T['null'] = function(x) {
	return getType(x) === 'null';
};

T.NULL.type = 'null';

T.nil = function(x) {
	return typeof x === 'undefined' || getType(x) === 'null';
};

T.nil.type = 'nil';

T.obj = T.object = function(x) {
	return getType(x) === 'object';
};

T.obj.type = 'object';

T.arr = T.array = function(x) {
	return Array.isArray(x);
};

T.arr.type = 'array';

T.arrayOf = function(propType) {

	var arrayOfType = function(x) {

		if (!Array.isArray(x)) {
			return false;
		}

		for (var i = 0; i < x.length; i++) {
			if (!propType(x[i])) {
				return false;
			}
		}

		return true;

	};

	arrayOfType.type = '[array of ' + propType.type + 's]';

	return arrayOfType;

};

T.not = function(propType) {

	var notType = function(x) {
		return !propType(x);
	};

	notType.type = 'not(' + propType.type + ')';

	return notType;

};

T['int'] = T.integer = function(x) {
	return typeof x === 'number' && isFinite(x) && Math.floor(x) === x;
};


T.integer.type = 'integer';

T.optional = T.undefined = function(x) {
	return typeof x === 'undefined';
};

T.optional.type = 'undefined';

T.bool = T['boolean'] = function(x) {
	return typeof x === 'boolean';
};

T.bool.type = 'boolean';

function quoteIfString(x) {
	return typeof x === 'string' ? ('"' + x + '"') : x;
}

T.exact = function(exactValue) {
	var exactType = function(x) {
		return x === exactValue;
	};
	var formattedValue = quoteIfString(exactValue);
	exactType.type = 'exact(' + formattedValue + ')';
	return exactType;
};

T.oneOf = function(values) {
	var oneOfType = function(x) {
		return values.reduce(function (success, next) { return success || (x === next); }, false);
	};
	var formattedValue = '[' + values.map(quoteIfString).join(', ') + ']';
	oneOfType.type = 'oneOf(' + formattedValue + ')';
	return oneOfType;
};

T.any = function() {
	return true;
};

T.any.type = 'any';

// recursive
T.schema = T['interface'] = function(schema) {
	var schemaType = function(prop, label) {
		return !T(schema)(prop, label || 'nested interface'); // returns null if success, so invert as boolean
	};
	schemaType.type = 'interface';
	return schemaType;
};

T.disabled = false;
T.throws = false;

var index$1 = T;

var SIDEBAR_WIDTH = 300;

var px = function (x) { return (x + "px"); };
var playerUrl = function (id) { return ("https://player.vimeo.com/video/" + id + "?autoplay=1"); };
var thumbUrl = function (id) { return ("https://i.vimeocdn.com/video/" + id + "_90x60.jpg"); };

var PlayerType = index$1({
  id: index$1.string,
});

var Player = {
  view: function view(ref) {
    var attrs = ref.attrs;

    PlayerType(attrs, 'Player');
    return (
      m('.player',
        m('iframe[frameborder=0][allowfullscreen]', {
          src: playerUrl(attrs.id),
          height: px(window.innerHeight),
          width: px(window.innerWidth - SIDEBAR_WIDTH),
        })
      )
    );
  },
};

var VideoType = index$1.schema({
  id: index$1.string,
  title: index$1.string,
  thumbnail: index$1.string,
});

var VideoLinkType = index$1({
  index: index$1.int,
  key: index$1.string,
  onSelection: index$1.fn,
  video: VideoType,
});

var VideoLink = {
  oncreate: function oncreate(ref) {
    var dom = ref.dom;

    dom.getElementsByTagName('img')[0].onload = function () { return dom.classList.add('entering'); };
  },
  view: function view(ref) {
    var attrs = ref.attrs;

    VideoLinkType(attrs, 'VideoLink');
    return (
      m('a.sidebar-video', {
        href: ("#" + (attrs.video.id)),
        onclick: function onclick(event) {
          if (event.ctrlKey || event.metaKey) { return; }
          attrs.onSelection(attrs.index);
          event.preventDefault();
        },
      },
      m('img.sidebar-video-thumbnail', {
        alt: 'Video thumbnail',
        src: thumbUrl(attrs.video.thumbnail),
      }),
      m('.sidebar-video-title', attrs.video.title)
      )
    );
  },
};

var SidebarType = index$1({
  onSelection: index$1.fn,
  videos: index$1.arrayOf(VideoType),
});

var Sidebar = {
  view: function view(ref) {
    var attrs = ref.attrs;
    var children = ref.children;

    SidebarType(attrs, 'Sidebar');
    return (
      m('.sidebar',
        children,
        m('div',
          attrs.videos.map(function (video, index) { return (
            m(VideoLink, { video: video, index: index, onSelection: attrs.onSelection, key: video.id })
          ); })
        )
      )
    );
  },
};

var db = [{"thumbnail": "574705336", "id": "169687255", "title": "BLINK - a BASE Jumping Flick - Mercedes-Benz Original"}, {"thumbnail": "591852945", "id": "181706731", "title": "LORN - ANVIL"}, {"thumbnail": "519450685", "id": "126883800", "title": "HC1 - Ultralight Travel Trailer"}, {"thumbnail": "506879066", "id": "119520956", "title": "Taking Pictures (Animated Short Film)"}, {"thumbnail": "582395331", "id": "175307649", "title": "Che Sensazione"}, {"thumbnail": " Sammi Meri Waar", "id": "136805591", "title": "Umair Jaswal & Quratulain Balouch"}, {"thumbnail": "596567699", "id": "186483277", "title": "Colorado By Drone"}, {"thumbnail": "527050804", "id": "129893541", "title": "Age reduction VFX | De-aging | Digital Cosmetics"}, {"thumbnail": "517291272", "id": "126745418", "title": "Mark Healey - Puerto Escondido 2015"}, {"thumbnail": "587667644", "id": "179689444", "title": "Last day at the fair!"}, {"thumbnail": "565914938", "id": "163018737", "title": "Dayvon's Dream"}, {"thumbnail": "575513125", "id": "151048885", "title": "Hjertef\u00c3\u00b8lgerne / The Heart Followers"}, {"thumbnail": "503184277", "id": "116728787", "title": "Lena Martinson // \\Playmate\\"}, {"thumbnail": "606465173", "id": "194492170", "title": "1+1=3"}, {"thumbnail": "515719214", "id": "125510141", "title": "The Gathering Testimony: Joanna Gaines"}, {"thumbnail": "562911176", "id": "160627722", "title": "Ambianc\u00c3\u00a9 - First short TRAILER - 7 Hours 20 Minutes in one take - by Anders Weberg."}, {"thumbnail": "559400048", "id": "134002940", "title": "Bluehue"}, {"thumbnail": "566604063", "id": "163328561", "title": "Diesel Sellerz Giveaways Explained."}, {"thumbnail": "597393082", "id": "187607365", "title": "A Filmmaker's Journey | Part 1: The Story"}, {"thumbnail": "538656818", "id": "141604820", "title": "Xoana Gonzalez al rojo vivo - Chica Soho Color"}, {"thumbnail": "503742952", "id": "116131870", "title": "Reggie"}, {"thumbnail": "536399419", "id": "140163198", "title": "ZERO-DAY"}, {"thumbnail": "556424060", "id": "155616916", "title": "Back to the Future Prequel Trailer: 1.21 Gigawatts"}, {"thumbnail": "526993061", "id": "133505216", "title": "Audrey Bradford \\Reine\\"}, {"thumbnail": "562183353", "id": "157967716", "title": "Why This Road: Dan Portelance"}, {"thumbnail": "518220267", "id": "127406495", "title": "Alc\u00c3\u00a1zar Gynecology Institute - Porn can save lives - Case Study"}, {"thumbnail": "576428700", "id": "171110991", "title": "Criola :: Espelhos do Racismo"}, {"thumbnail": "618058381", "id": "203671501", "title": "Analogue Loaders"}, {"thumbnail": "559485098", "id": "158075143", "title": "The Gnomist: A Great Big Beautiful Act Of Kindness"}, {"thumbnail": "629080609", "id": "212323382", "title": "Lil Dicky - Pillow Talking feat. Brain (Official Music Video)"}, {"thumbnail": "608414112", "id": "196039784", "title": "Noah hits 240 green lights."}, {"thumbnail": "603302127", "id": "132186137", "title": "\\Ajde!\\ The Movie"}, {"thumbnail": "506689964", "id": "118484124", "title": "friuli-goddesses of the grapes!"}, {"thumbnail": "534378743", "id": "138802207", "title": "Death in Space"}, {"thumbnail": "543020259", "id": "145029572", "title": "Missile launch over San Francisco"}, {"thumbnail": "559030844", "id": "156684127", "title": "Remakes"}, {"thumbnail": "519483178", "id": "128376432", "title": "\u00d0\u0161\u00d0\u00b0\u00d0\u00bb\u00d0\u00b5\u00d0\u00bd\u00d0\u00b4\u00d0\u00b0\u00d1\u20ac\u00d1\u0152 Simple"}, {"thumbnail": "536817435", "id": "139672650", "title": "PACIFIC GRADE"}, {"thumbnail": "525766706", "id": "132904783", "title": "HegreSexED: Crystal Stone Exercises Trailer"}, {"thumbnail": "507889068", "id": "120167784", "title": "Tie-side micro bikini"}, {"thumbnail": "609044033", "id": "196535809", "title": "Download Dangal (2016) FULL`Movie HD 1080p"}, {"thumbnail": "516372344", "id": "126061288", "title": "Reflections from Uyuni"}, {"thumbnail": "509260961", "id": "121162967", "title": "What if Wes Anderson directed X-Men?"}, {"thumbnail": "567697388", "id": "163177535", "title": "Falling Tide \u00e8\u0090\u00bd\u00e6\u00bd\u00ae"}, {"thumbnail": "528206545", "id": "134628811", "title": "Kamil Bednarek - List"}, {"thumbnail": "551374592", "id": "151579457", "title": "\\Kara\\ (2016) (An Unofficial Star Wars Film)"}, {"thumbnail": "530344230", "id": "135960434", "title": "The Colors of Feelings"}, {"thumbnail": "614918183", "id": "201196420", "title": "Ajax"}, {"thumbnail": "584199133", "id": "122959827", "title": "THE REINVENTION OF NORMAL"}, {"thumbnail": "537529505", "id": "140693423", "title": "#newAsana - Do Great Things Together"}, {"thumbnail": "602028621", "id": "191122488", "title": "A Filmmaker's Journey | Part 2: Pre-production"}, {"thumbnail": "628044360", "id": "174312494", "title": "Vorticity (4K)"}, {"thumbnail": "595490695", "id": "185476327", "title": "Compta amb mi"}, {"thumbnail": "531343131", "id": "136718012", "title": "Warwick Rowers 2016 Crowdfunder"}, {"thumbnail": "590671218", "id": "181856947", "title": "Long Term Parking"}, {"thumbnail": "587379887", "id": "179456952", "title": "Guy Fieri eating to \\Hurt\\ By Johnny Cash"}, {"thumbnail": "518556628", "id": "127694736", "title": "Construction of The International Flag of Planet Earth"}, {"thumbnail": "639845725", "id": "180016993", "title": "DJ Shadow ft. Run The Jewels - Nobody Speak"}, {"thumbnail": "522435419", "id": "130522248", "title": "R\u00c3\u00a9publique / Filles du calvaire"}, {"thumbnail": "527566221", "id": "134173961", "title": "The Chase"}, {"thumbnail": "519784703", "id": "128592752", "title": "Russian Nude Model LERA X"}, {"thumbnail": "518370303", "id": "127551931", "title": "DIRTY PAWS"}, {"thumbnail": " London", "id": "171119383", "title": "MIRROR BOX | Performance by Milo Moir\u00c3\u00a9 -censored- (D\u00c3\u00bcsseldorf"}, {"thumbnail": "532737202", "id": "137711830", "title": "Star Wars Poetry"}, {"thumbnail": "593855457", "id": "175491863", "title": "Pier 9 Artist in Residence Program"}, {"thumbnail": "556174452", "id": "141273968", "title": "The Light Story"}, {"thumbnail": "512216155", "id": "122820340", "title": "#LetFarvaOut - SUPER TROOPERS 2 - OFFICIAL INDIEGOGO VIDEO"}, {"thumbnail": "566824972", "id": "163454302", "title": "Orgulloso de ser ecuatoriano video Terremoto 16/04/2016"}, {"thumbnail": "631761894", "id": "215111585", "title": "Last Meal | Season 1 | \\Logan Lynn\\"}, {"thumbnail": "603511792", "id": "192213684", "title": "INTRODUCING THE 2017 NU MUSES CALENDAR"}, {"thumbnail": "583233382", "id": "176056164", "title": "Vendo apartamento \u00c3\u0081guas Claras DF - Cassio Regal SIA"}, {"thumbnail": "585747473", "id": "174179940", "title": "LENNY KRAVITZ | Alexandre Chatelard"}, {"thumbnail": "578648835", "id": "172731032", "title": "Affinity Designer for Windows"}, {"thumbnail": "518126249", "id": "127358515", "title": "Timelapse Sisyphus 1"}, {"thumbnail": "530644329", "id": "136223988", "title": "New Horizons Pluto flyby"}, {"thumbnail": "605460090", "id": "193674451", "title": "Makeba / Jain"}, {"thumbnail": "511794272", "id": "122709611", "title": "Hawaii Five-O"}, {"thumbnail": "517292111", "id": "126747807", "title": "Reverie of Vietnam"}, {"thumbnail": "535500978", "id": "139358538", "title": "Lenny's Garage"}, {"thumbnail": "543321032", "id": "145251635", "title": "DIFFUSION"}, {"thumbnail": "567002589", "id": "163590531", "title": "BALANCE"}, {"thumbnail": "602810078", "id": "191632804", "title": "PARADISE - A contemporary interpretation of The Garden of Earthly Delights"}, {"thumbnail": "525171779", "id": "132462576", "title": "Journey through the layers of the mind"}, {"thumbnail": "523245247", "id": "131119328", "title": "Alexander Tikhomirov. Life Or Dream. Sri-Lanka"}, {"thumbnail": "503202799", "id": "116746233", "title": "Dji. Death Sails"}, {"thumbnail": "564041913", "id": "117934677", "title": "Mr Selfie"}, {"thumbnail": "557101487", "id": "156161909", "title": "A Taste of Vienna"}, {"thumbnail": "571746024", "id": "167433178", "title": "FUEL"}, {"thumbnail": "564045818", "id": "161613650", "title": "First and Final Frames of Series"}, {"thumbnail": "548037319", "id": "148955244", "title": "Quentin Tarantino's Visual References"}, {"thumbnail": "559049766", "id": "157712307", "title": "Microsculpture"}, {"thumbnail": "628033682", "id": "211758157", "title": "Deeply Artificial Trees"}, {"thumbnail": "538925648", "id": "141812811", "title": "Apollo Missions"}, {"thumbnail": "513252595", "id": "123785769", "title": "The Shop SF_Superhero Post-It Mural"}, {"thumbnail": "502897588", "id": "116518067", "title": "The Human Bot Fly"}, {"thumbnail": "625151268", "id": "209497584", "title": "Spring"}, {"thumbnail": "519371213", "id": "128292930", "title": "Finals Week - Spoken Word by Stefan Vandenkooy"}, {"thumbnail": "590514082", "id": "144081694", "title": "#S\u00c3\u00admboloSoHo 45 \u00e2\u2020\u2019 Paloma Fiuza"}, {"thumbnail": "560210070", "id": "158621612", "title": "Sicily.co.uk"}, {"thumbnail": "574768537", "id": "153248396", "title": "Billions Season 1: Distinction of Billions"}, {"thumbnail": "579647208", "id": "173368686", "title": "Jon Gjerde Hanggliding G-force - 28th June 2016"}, {"thumbnail": "614284207", "id": "200658247", "title": "SHY LUV - SHOCK HORROR feat Jones"}, {"thumbnail": "520824067", "id": "129364571", "title": "EROTIC DREAMS (sex version)"}, {"thumbnail": " C\u00c3\u00a1ssia Nunes", "id": "194573362", "title": "Natasha de Albuquerque"}, {"thumbnail": "516585904", "id": "126220314", "title": "The Message from the Lungs (Thai Health Promotion Foundation)"}, {"thumbnail": "518942136", "id": "127972920", "title": "Announcement"}, {"thumbnail": "628779335", "id": "212722584", "title": "Cassius ft. Cat Power Pharrell Williams | Go Up"}, {"thumbnail": "598845546", "id": "137221490", "title": "Ishtar X Tussilago"}, {"thumbnail": "523140485", "id": "131046102", "title": "The Life & Death of an iPhone"}, {"thumbnail": "549173888", "id": "149850024", "title": "Rise & Shine"}, {"thumbnail": "634591715", "id": "214781800", "title": "GLOW"}, {"thumbnail": "546475655", "id": "147729661", "title": "Promo de Naked Language"}, {"thumbnail": "523249751", "id": "130671173", "title": "Do Your Own Mortgage"}, {"thumbnail": "574702569", "id": "169850570", "title": "Making Weather"}, {"thumbnail": "510027139", "id": "121614525", "title": "Con Man Indiegogo Campaign"}, {"thumbnail": "542765330", "id": "144828601", "title": "Disturbed \\The Sound Of Silence\\ (Official Video)"}, {"thumbnail": " Inc.", "id": "163266757", "title": "Sky Magic Live at Mt.Fuji : Drone Ballet Show by MicroAd"}, {"thumbnail": "520757158", "id": "129314425", "title": "Mad Max: Center Framed"}, {"thumbnail": "604717170", "id": "193125533", "title": "Karim Sulayman - I trust you"}, {"thumbnail": "556162410", "id": "155411363", "title": "Is this Bernie Sanders being arrested?"}, {"thumbnail": "612716751", "id": "199463183", "title": "F \u00e2\u20ac\u201d mdls."}, {"thumbnail": "544376512", "id": "146029996", "title": "Home Depot's Jewish Secret to Success"}, {"thumbnail": "544956819", "id": "146534283", "title": "FINLAND | Timelapse"}, {"thumbnail": "545078272", "id": "146633712", "title": "Manna From Heaven"}, {"thumbnail": "595267487", "id": "185503901", "title": "Make Waves"}, {"thumbnail": "509706466", "id": "121436114", "title": "as\u00c2\u00b7phyx\u00c2\u00b7i\u00c2\u00b7a"}, {"thumbnail": "586973227", "id": "178941014", "title": "Kenobi: A Star Wars Story Teaser"}, {"thumbnail": "536866984", "id": "140461916", "title": "JUICE PORN: Women Redefine Sexy"}, {"thumbnail": " 12 July 2015", "id": "133398724", "title": "Slow Motion Lightning"}, {"thumbnail": "563867305", "id": "161599224", "title": "Wrapped"}, {"thumbnail": "578212507", "id": "172252797", "title": "Not"}, {"thumbnail": "508806906", "id": "120814797", "title": "Paris of the Plains"}, {"thumbnail": "523843756", "id": "131552145", "title": "Amazing in Motion - Slide"}, {"thumbnail": "584403440", "id": "126077901", "title": "Mother"}, {"thumbnail": "591857419", "id": "182793995", "title": "Isabelle Daza and Adrien Semblat Wedding"}, {"thumbnail": "518494185", "id": "123978073", "title": "Happier Camper HC1 Adaptiv\u00e2\u201e\u00a2 Modular Interior Demo"}, {"thumbnail": "523722676", "id": "131462825", "title": "Action Man: Battlefield Casualties"}, {"thumbnail": "593898806", "id": "184448596", "title": "Tom Hanks Crashes Our Wedding"}, {"thumbnail": "557292113", "id": "156299091", "title": "Rihanna - Work (Explicit) ft. Drake"}, {"thumbnail": "556608883", "id": "155764781", "title": "Olivia: The Preview"}, {"thumbnail": "547071707", "id": "148198462", "title": "SOAR: An Animated Short"}, {"thumbnail": " Arizona - July 2016", "id": "175329108", "title": "Microburst 1 - Phoenix"}, {"thumbnail": "559617660", "id": "158160346", "title": "History of Rock"}, {"thumbnail": "599878316", "id": "118532076", "title": "FLORIDA MAN"}, {"thumbnail": "624012124", "id": "208642358", "title": "Autonomous Trap 001"}, {"thumbnail": "513912477", "id": "124260638", "title": "Remy LaCroix - Pink Lust"}, {"thumbnail": "515988922", "id": "125527643", "title": "The Alchemist's Letter"}, {"thumbnail": "590513432", "id": "154320897", "title": "#S\u00c3\u00admboloSoHo48 \u00e2\u2020\u2019 Melissa Paredes"}, {"thumbnail": "524505666", "id": "132022828", "title": "StasyQ #153 by Said Energizer"}, {"thumbnail": "558689632", "id": "157413485", "title": "Monarch Slave Dr. Shaun D. speaks about project monarch -a conspiracy in Monarch Slavery in Canada"}, {"thumbnail": "516655452", "id": "126267047", "title": "Sensational film footage! Berlin after the apocalypse in color and HD - Berlin In July 1945 (HD 1080p)"}, {"thumbnail": "544277735", "id": "145963216", "title": "Paige Spiranac Takes Golf To The Streets"}, {"thumbnail": "595328997", "id": "159449591", "title": "Curmudgeons"}, {"thumbnail": "509857547", "id": "121526715", "title": "Elizabeth Marxs - Stetson"}, {"thumbnail": "549929267", "id": "150423718", "title": "Of Oz the Wizard"}, {"thumbnail": "593605564", "id": "184206731", "title": "Do you tits hang low?"}, {"thumbnail": "604160981", "id": "192711856", "title": "Neural Story Singing Christmas"}, {"thumbnail": "558158194", "id": "156991650", "title": "Britany LaManna Wedding"}, {"thumbnail": "507944652", "id": "120206922", "title": "The Thousand Year Journey: Oregon To Patagonia"}, {"thumbnail": "559316583", "id": "157937153", "title": "MythBusters Series Finale Video"}, {"thumbnail": "528313191", "id": "134701637", "title": "StasyQ #149 by Said Energizer"}, {"thumbnail": "533065125", "id": "132695239", "title": "OFFLINE DATING"}, {"thumbnail": "507924470", "id": "118434141", "title": "RAMBO DAY."}, {"thumbnail": "556958815", "id": "156045670", "title": "Bonjour Paris | A Hyperlapse Film - In 4K"}, {"thumbnail": "585763747", "id": "178212429", "title": "Off the Grid on a Homemade Island"}, {"thumbnail": "545322462", "id": "146822483", "title": "StasyQ #100 by Said Energizer"}, {"thumbnail": "562208958", "id": "160263943", "title": "\\A New Awakening\\ - Star Wars Episode IV and VII Shot Comparison"}, {"thumbnail": "545148112", "id": "146687239", "title": "ME! ME! ME! Uncensored"}, {"thumbnail": "562222012", "id": "160272393", "title": "StasyQ Loves You by Said Energizer"}, {"thumbnail": "594171041", "id": "166317601", "title": "Don't go to Iran"}, {"thumbnail": "545203276", "id": "146731428", "title": "Brent Ray Fraser performs on France Got Talent 2015"}, {"thumbnail": "519303433", "id": "127851841", "title": "An introduction to Flow\u00e2\u201e\u00a2 Hive"}, {"thumbnail": "590331912", "id": "163062194", "title": "Chris Brown - Welcome to My Life - Trailer"}, {"thumbnail": "503038425", "id": "116585007", "title": "Playing with Power"}, {"thumbnail": "505446337", "id": "118431867", "title": "Hearing Tarantino"}, {"thumbnail": "600720958", "id": "190156799", "title": "Spell of Magic ~ So-Star ft. Que Da Wiz (Out Now 1st October 2016)"}, {"thumbnail": "521197109", "id": "129634826", "title": "Emotions Of Pixar"}, {"thumbnail": "550367552", "id": "129346968", "title": "DAWN OF THE..STUFF. FULL LENGTH TRAILER"}, {"thumbnail": "564300929", "id": "161949709", "title": "Lytro Cinema"}, {"thumbnail": "639581696", "id": "196683500", "title": "WoodSwimmer"}, {"thumbnail": "577313021", "id": "161526014", "title": "Why This Road: Chris Yacoubian"}, {"thumbnail": "547434123", "id": "148482082", "title": "Curvepower"}, {"thumbnail": "570255381", "id": "131586644", "title": "The Emperor of Time"}, {"thumbnail": "511469471", "id": "122477599", "title": "Love Boat"}, {"thumbnail": "525509067", "id": "132725292", "title": "HOW TO RIDE BITCH"}, {"thumbnail": "623748977", "id": "208432684", "title": "NORTHBOUND | Skateboarding on Frozen Sand 4K"}, {"thumbnail": "556164776", "id": "155404383", "title": "Skylight: A 4K Timelapse Film"}, {"thumbnail": "611998162", "id": "172273624", "title": "Make Inishturk Great Again"}, {"thumbnail": "514317022", "id": "124139626", "title": "SUN"}, {"thumbnail": " \\PomPom Mirror", "id": "128375543", "title": "Daniel Rozin"}, {"thumbnail": "571881602", "id": "167414855", "title": "Chaud Lapin - Animated Short Movie"}, {"thumbnail": "507761994", "id": "120068639", "title": "DREAM WALKER III - Zakynthos [Rope Jumping - no limit expedition]"}, {"thumbnail": "586233346", "id": "178560888", "title": "Indy learns to crawl"}, {"thumbnail": "562478364", "id": "160476309", "title": "HOW TO RIDE... BITCHES"}, {"thumbnail": "510168862", "id": "121705174", "title": "Japan's Disposable Workers: Net Cafe Refugees"}, {"thumbnail": "540737468", "id": "143161189", "title": "Introducing Boomerang from Instagram"}, {"thumbnail": "549966438", "id": "136611737", "title": "Architecture of Radio"}, {"thumbnail": "544521337", "id": "146064760", "title": "ACROSS THE SKY - a world record slackline in the utah desert"}, {"thumbnail": "595714605", "id": "182779637", "title": "\\MEDIATION\\ - FULL FILM"}, {"thumbnail": "569155087", "id": "165244571", "title": "Saturday Super Session"}, {"thumbnail": "556174241", "id": "141273851", "title": "Light L16 Camera (2015 Launch Anthem)"}, {"thumbnail": "636522804", "id": "218915093", "title": "\u00d0\u2014\u00d0\u00be\u00d0\u00bc\u00d0\u00b1\u00d0\u00b8-3 (\u00d0\u0090\u00d0\u00bd\u00d1\u201a\u00d0\u00b8\u00d0\u00bc\u00d0\u00b8\u00d1\u20ac) \u00d1\u0081\u00d0\u00b5\u00d1\u20ac\u00d0\u00b8\u00d1\u008f 6"}, {"thumbnail": "565579607", "id": "162855085", "title": "100 Years/100 Shots"}, {"thumbnail": "598951237", "id": "188824745", "title": "Eric Dossantos BASE jump wingsuit through tree and survives ! https://youtu.be/kp3YLdhraPw"}, {"thumbnail": "517674965", "id": "127032605", "title": "Hand Drawn Logos"}, {"thumbnail": "520500344", "id": "129111790", "title": "LINDEMANN - Praise Abort (Official Video)"}, {"thumbnail": "510822998", "id": "122102861", "title": "Wave"}, {"thumbnail": "598255641", "id": "188245427", "title": "Sean & Karel | Nagsimula"}, {"thumbnail": "604919305", "id": "146049113", "title": "ABOVE ILIAMNA"}, {"thumbnail": "627968620", "id": "201490313", "title": "Lion_Calling_01282017_Clip"}, {"thumbnail": "523360861", "id": "130468614", "title": "World Population"}, {"thumbnail": "636707265", "id": "219046468", "title": "FRACTAL - 4k StormLapse"}, {"thumbnail": "530679653", "id": "136228343", "title": "Los Angeles"}, {"thumbnail": "540781562", "id": "142398964", "title": "Warwick Rowers 2016 Calendar"}, {"thumbnail": "627006376", "id": "119082833", "title": "The Girlfriend Game"}, {"thumbnail": "569238956", "id": "165389537", "title": "Gregory Hannley for President Intro"}, {"thumbnail": " Tajdar-e-Haram", "id": "136230324", "title": "Atif Aslam"}, {"thumbnail": "607688565", "id": "195433452", "title": "Ice Call - Sam Favret / Backyards Project"}, {"thumbnail": "519859940", "id": "128545540", "title": "Free the Nipple UCSD 2015 - UNCENSORED"}, {"thumbnail": "506242951", "id": "119087147", "title": "The Evolution of Batman in Cinema"}, {"thumbnail": "589969109", "id": "179791907", "title": "Frank Ocean - 'Nikes'"}, {"thumbnail": "547654836", "id": "148643920", "title": "The End Of Prayer Shaming"}, {"thumbnail": "525580644", "id": "130695665", "title": "Trash Cat"}, {"thumbnail": "532959547", "id": "137873629", "title": "\\Softly & Tenderly\\"}, {"thumbnail": "508103627", "id": "120320355", "title": "Chiz \u00e2\u009d\u00a4 Heart -- Wedding Highlights"}, {"thumbnail": " Valentine's Day 2015", "id": "119396404", "title": "Beautiful Agony"}, {"thumbnail": " Sex Strains", "id": "189703766", "title": "Naked Weed Report: Slutty Girl Problems"}, {"thumbnail": "513204107", "id": "123747962", "title": "Next Order of The Shoe"}, {"thumbnail": "569143434", "id": "165313475", "title": "Sundara - Blue Ridge Trout Fest Version"}, {"thumbnail": "510079620", "id": "121649600", "title": "A Taste of Austria"}, {"thumbnail": "637915470", "id": "219993811", "title": "Jupiter: Juno Perijove 06"}, {"thumbnail": "515518597", "id": "125425152", "title": "edifice"}, {"thumbnail": "565232060", "id": "162657490", "title": "BONDAGE by Eric Allen Bell (2006 SXSW)"}, {"thumbnail": "514168761", "id": "122854959", "title": "Los Angeles Clippers 3D Court Projection 3/20/15"}, {"thumbnail": "541188715", "id": "143572484", "title": "naked oil wrestling at Burning Man 2015"}, {"thumbnail": "523574031", "id": "131356358", "title": "StasyQ #121 by Said Energizer"}, {"thumbnail": "528073804", "id": "134530201", "title": "PATAGONIA 8K"}, {"thumbnail": "562007740", "id": "160106226", "title": "Bonnie Rotten Walks Topless Through NYC"}, {"thumbnail": "614086863", "id": "200550228", "title": "La La Land - Movie References"}, {"thumbnail": "532653570", "id": "137531269", "title": "Wire Cutters"}, {"thumbnail": "532694676", "id": "137675910", "title": "Baahubali: VFX Breakdown"}, {"thumbnail": "542176950", "id": "144355064", "title": "Hello - Adele ASL Interpretation"}, {"thumbnail": "552482201", "id": "152475107", "title": "StasyQ #174 by Said Energizer"}, {"thumbnail": "554413484", "id": "153979733", "title": "The Revenant by Tarkovsky"}, {"thumbnail": "504311688", "id": "117548483", "title": "Asia and a Motorbike"}, {"thumbnail": "637662533", "id": "219812088", "title": "\u00d0\u2014\u00d0\u00be\u00d0\u00bc\u00d0\u00b1\u00d0\u00b8-3 (\u00d0\u0090\u00d0\u00bd\u00d1\u201a\u00d0\u00b8\u00d0\u00bc\u00d0\u00b8\u00d1\u20ac) \u00d1\u0081\u00d0\u00b5\u00d1\u20ac\u00d0\u00b8\u00d1\u008f 7"}, {"thumbnail": "598047310", "id": "188093656", "title": "Lindener Narren laden jugendliche Migranten zum Tanztraining ein"}, {"thumbnail": "538042128", "id": "141172503", "title": "StasyQ #168 by Said Energizer"}, {"thumbnail": "578156864", "id": "172374044", "title": "Iloura 2016 Game of Thrones Season 6 breakdown reel"}, {"thumbnail": "523529480", "id": "122348837", "title": "Tyrese feat. Snoop Dogg \\DUMB SHIT\\ Official Music Video"}, {"thumbnail": "520959748", "id": "129426512", "title": "Come / Jain"}, {"thumbnail": " by Roberto Flores Photography", "id": "117867680", "title": "Yuvi Pallares"}, {"thumbnail": "536562292", "id": "140265561", "title": "The Story Of Technoviking - 2016 - Short Version - EN DE ES subs"}, {"thumbnail": "638857321", "id": "220764139", "title": "\u0417\u043e\u043c\u0431\u0438-3 (\u0410\u043d\u0442\u0438\u043c\u0438\u0440) \u0441\u0435\u0440\u0438\u044f 8"}, {"thumbnail": "519918434", "id": "128693259", "title": "Masha y el oso: Masha juega al tenis."}, {"thumbnail": "502372803", "id": "116123916", "title": "ANGELINA MUR | MAX TWAIN"}, {"thumbnail": "561879168", "id": "159821179", "title": "Igneous Skis"}, {"thumbnail": "641246425", "id": "222654242", "title": "\u0417\u043e\u043c\u0431\u0438-3 (\u0410\u043d\u0442\u0438\u043c\u0438\u0440) \u0441\u0435\u0440\u0438\u044f 10"}, {"thumbnail": "515900341", "id": "125692953", "title": "(uncensored) Your naked body is not a crime. Is nude art obscene?"}, {"thumbnail": "561420549", "id": "159628020", "title": "Jameson First Shot Winners Reveal"}, {"thumbnail": "618602966", "id": "204150149", "title": "Leningrad - Kolshik"}, {"thumbnail": " Taiwan", "id": "136218526", "title": "Danjiang Bridge Animation"}, {"thumbnail": "522554237", "id": "130622230", "title": "CALBUCO"}, {"thumbnail": "527967223", "id": "134457118", "title": "4K : Czech Nude Model ANETTA KEYS"}, {"thumbnail": "634056952", "id": "216960551", "title": "\u00d0\u2014\u00d0\u00be\u00d0\u00bc\u00d0\u00b1\u00d0\u00b8-3 (\u00d0\u0090\u00d0\u00bd\u00d1\u201a\u00d0\u00b8\u00d0\u00bc\u00d0\u00b8\u00d1\u20ac) \u00d1\u0081\u00d0\u00b5\u00d1\u20ac\u00d0\u00b8\u00d1\u008f 4"}, {"thumbnail": "504058346", "id": "117375257", "title": "Crabs"}, {"thumbnail": "590245077", "id": "181628606", "title": "Watch This Self-Proclaimed Idiot Hop Freight Trains To Montauk"}, {"thumbnail": "548239061", "id": "128447033", "title": "Ogilvy & Mather HK - Blockbuster Pizza Box"}, {"thumbnail": "538478795", "id": "140469553", "title": "Rhei - time flows. Literally"}, {"thumbnail": "538536827", "id": "141516172", "title": "Morning Ebb And Flow"}, {"thumbnail": "546401667", "id": "147671009", "title": "OVO LA FLAGSHIP"}, {"thumbnail": "540198528", "id": "142799371", "title": "NADYA BY ALEXANDER TIKHOMIROV"}, {"thumbnail": "534939060", "id": "139219694", "title": "NAKED SELFIES | Performance by Milo Moir\u00c3\u00a9 (2015)"}, {"thumbnail": "507826786", "id": "120122779", "title": "Finding Valentine"}, {"thumbnail": "565018964", "id": "162531355", "title": "Player Two"}, {"thumbnail": "503201967", "id": "116742009", "title": "I like to fly"}, {"thumbnail": "594544178", "id": "184941133", "title": "Amphitrite"}, {"thumbnail": "524553913", "id": "132057968", "title": "Paul Soriano and Celestine Gonzaga - Soriano | 6.12.15"}, {"thumbnail": "515999185", "id": "123613550", "title": "En Plein Vol (cr\u00c3\u00a9ation 2014)"}, {"thumbnail": "516523236", "id": "126177413", "title": "An Object at Rest"}, {"thumbnail": "549857972", "id": "150389574", "title": "Kendrick Lamar - God Is Gangsta"}, {"thumbnail": "563105073", "id": "160978158", "title": "Jenny Scordamaglia Nude Beach Run Jamaica HD"}, {"thumbnail": "516923687", "id": "126129580", "title": "McDonald\u00e2\u20ac\u2122s BagTray"}, {"thumbnail": "545416851", "id": "146893658", "title": "Introducing PIZERO"}, {"thumbnail": "568765339", "id": "164965483", "title": "My Baby You'll Be"}, {"thumbnail": "512052244", "id": "122325664", "title": "SUNDAYS"}, {"thumbnail": "591991275", "id": "182940406", "title": "Who is Jesus?"}, {"thumbnail": "640039908", "id": "221703455", "title": "\u0417\u043e\u043c\u0431\u0438-3 (\u0410\u043d\u0442\u0438\u043c\u0438\u0440) \u0441\u0435\u0440\u0438\u044f 9"}, {"thumbnail": "634612267", "id": "217407298", "title": "SKYGLOWPROJECT.COM: KAIBAB ELEGY"}, {"thumbnail": "505438788", "id": "117965348", "title": "PLUG & PLAY - Game"}, {"thumbnail": "543393204", "id": "118471437", "title": "Le Gouffre"}, {"thumbnail": "533039705", "id": "137925493", "title": "Star Wars: The New Republic Anthology"}, {"thumbnail": "562585300", "id": "160247780", "title": "Underachievers \\Pilot\\"}, {"thumbnail": "510966497", "id": "122184476", "title": "Tokyo Total Madness - Go behind the scenes with Petter Hegre."}, {"thumbnail": "525500199", "id": "132718845", "title": "StasyQ #124 by Said Energizer"}, {"thumbnail": "569496584", "id": "165592795", "title": "Star Wars - Episode V \\The Empire Strikes Back\\ Homage (Title Sequence)"}, {"thumbnail": "507248184", "id": "119717009", "title": "The making of the viral \\Luba Nude Yoga\\ photos"}, {"thumbnail": "568014295", "id": "164416086", "title": "NEW YORK RISING"}, {"thumbnail": "505403784", "id": "118394790", "title": "Utvecklingsst\u00c3\u00b6rd (Official Uncensored Video)"}, {"thumbnail": "632790766", "id": "215946019", "title": "\u00d0\u2014\u00d0\u00be\u00d0\u00bc\u00d0\u00b1\u00d0\u00b8-3 (\u00d0\u0090\u00d0\u00bd\u00d1\u201a\u00d0\u00b8\u00d0\u00bc\u00d0\u00b8\u00d1\u20ac) \u00d1\u0081\u00d0\u00b5\u00d1\u20ac\u00d0\u00b8\u00d1\u008f 3"}, {"thumbnail": "567903940", "id": "164290505", "title": "Views"}, {"thumbnail": "630331146", "id": "213975335", "title": "\u00d0\u2014\u00d0\u00be\u00d0\u00bc\u00d0\u00b1\u00d0\u00b8-3 (\u00d0\u0090\u00d0\u00bd\u00d1\u201a\u00d0\u00b8\u00d0\u00bc\u00d0\u00b8\u00d1\u20ac) \u00d1\u0081\u00d0\u00b5\u00d1\u20ac\u00d0\u00b8\u00d1\u008f 1"}, {"thumbnail": "516372173", "id": "126060304", "title": "Fears"}, {"thumbnail": "513796881", "id": "124174282", "title": "Moses Goes Down"}, {"thumbnail": "635306681", "id": "217959803", "title": "\u00d0\u2014\u00d0\u00be\u00d0\u00bc\u00d0\u00b1\u00d0\u00b8-3 (\u00d0\u0090\u00d0\u00bd\u00d1\u201a\u00d0\u00b8\u00d0\u00bc\u00d0\u00b8\u00d1\u20ac) \u00d1\u0081\u00d0\u00b5\u00d1\u20ac\u00d0\u00b8\u00d1\u008f 5"}, {"thumbnail": "524949193", "id": "132329259", "title": "Kali 2.0 Teaser - Kali Sana!"}, {"thumbnail": "574544858", "id": "169731681", "title": "Target"}, {"thumbnail": "571397136", "id": "167054481", "title": "When We Were Knights"}, {"thumbnail": "545650651", "id": "144099716", "title": "Post-Human "}, {"thumbnail": "527823735", "id": "133202655", "title": "Edge of Stability"}, {"thumbnail": "524568939", "id": "132038125", "title": "Loving Lanka"}, {"thumbnail": "522917841", "id": "130887362", "title": "StasyQ #109 by Said Energizer"}, {"thumbnail": "564471311", "id": "162088181", "title": "High Velocity Aerial Filming"}, {"thumbnail": "505804324", "id": "118697231", "title": "Moments In Love Music Video"}, {"thumbnail": "529588533", "id": "135580602", "title": "Trinity"}, {"thumbnail": "506986076", "id": "119564713", "title": "Pancakes @ Fedor Shmidt (for Golden Girls)"}, {"thumbnail": "525292422", "id": "132571771", "title": "Game of Thrones (HBO) - Hardhome (VFX Breakdown)"}, {"thumbnail": "594972812", "id": "185277354", "title": "Angles"}, {"thumbnail": "576763415", "id": "171342930", "title": "\u00e2\u20ac\u0153Broadway for Orlando\u00e2\u20ac\u009d: The Exclusive Music Video"}, {"thumbnail": "534310503", "id": "138790270", "title": "Glen Keane \u00e2\u20ac\u201c Step into the Page"}, {"thumbnail": "545771727", "id": "147173661", "title": "TAME IMPALA 'The Less I Know The Better'"}, {"thumbnail": "620172222", "id": "205412604", "title": "Soy ordinaria"}, {"thumbnail": "534815647", "id": "139134394", "title": "StasyQ #165 by Said Energizer"}, {"thumbnail": "547872389", "id": "148826828", "title": "Joey and Indy in the living room"}, {"thumbnail": "622159707", "id": "207076450", "title": "A FICTIVE FLIGHT ABOVE REAL MARS"}, {"thumbnail": "526274394", "id": "133268406", "title": "StasyQ #160 by Said Energizer"}, {"thumbnail": "600063378", "id": "189402941", "title": "Powerwall 2 & Solar Roof Launch"}, {"thumbnail": "513179539", "id": "123732723", "title": "MC Tati Zaqui - Parara Tibum (KondZilla)"}, {"thumbnail": "533406125", "id": "138170379", "title": "Radical Self-Acceptance: An Experiment/Performance by Amy Pence-Brown"}, {"thumbnail": "631575384", "id": "214969814", "title": "\u00d0\u2014\u00d0\u00be\u00d0\u00bc\u00d0\u00b1\u00d0\u00b8-3 (\u00d0\u0090\u00d0\u00bd\u00d1\u201a\u00d0\u00b8\u00d0\u00bc\u00d0\u00b8\u00d1\u20ac) \u00d1\u0081\u00d0\u00b5\u00d1\u20ac\u00d0\u00b8\u00d1\u008f 2"}, {"thumbnail": " Kashmir", "id": "155212414", "title": "Leopard in the snow in Gulmarg"}, {"thumbnail": "561908736", "id": "160024074", "title": "\\The Old New World\\ (Photo-based animation project)"}, {"thumbnail": "539475259", "id": "142215364", "title": "Swing Dancers vs. Street Dancers @ Montreal Swing Riot 2015"}, {"thumbnail": "502819707", "id": "116458086", "title": "Jennifer: Sunset Dancer"}, {"thumbnail": "506119283", "id": "118970464", "title": "Azin Fahimi - Every Man"}, {"thumbnail": "557992054", "id": "156852806", "title": "Wikkelhouse"}, {"thumbnail": "608229467", "id": "195866734", "title": "DIE ANTWOORD - FAT FADED FUCK FACE (Official Video)"}, {"thumbnail": "525920655", "id": "133005702", "title": "\u00e7\u2020\u00b1\u00e8\u02c6\u017e (\u00e8\u00b7\u00b3\u00e8\u02c6\u017e\u00e6\u2013\u00b0\u00e5\u00a8\u02dc)"}, {"thumbnail": "560650167", "id": "159011768", "title": "\\Deadpool\\ Visual Effects Breakdown"}, {"thumbnail": "566810812", "id": "163445503", "title": "The Making of A Fighting Chance"}, {"thumbnail": "520807070", "id": "129352943", "title": "Free The Nipple in New York City"}, {"thumbnail": "522066969", "id": "129866135", "title": "Hanging in the Woods"}, {"thumbnail": "560359297", "id": "158772658", "title": "Joey Martin Feek memorial video"}, {"thumbnail": "584345527", "id": "177001947", "title": "Getting the Signals! ~ So-Star ft. Dying Seed (Official Music Video) - Out Now 1st August 2016"}, {"thumbnail": "573810182", "id": "169160981", "title": "\\SIGN\\ - Vanessa Tuna"}, {"thumbnail": "581739374", "id": "174723065", "title": "Jameson - First Shot"}, {"thumbnail": "521268221", "id": "129335481", "title": "The Cinder Cone"}, {"thumbnail": "566242566", "id": "163153865", "title": "Kung Fu Motion Visualization"}, {"thumbnail": "511870732", "id": "122762336", "title": "Today I Rise"}, {"thumbnail": "550551137", "id": "150938166", "title": "LP Certified - DRILLIN"}, {"thumbnail": "563939083", "id": "161655689", "title": "Hannibal Bank Seamount Expedition"}, {"thumbnail": "531398810", "id": "136764796", "title": "GLASS"}, {"thumbnail": "540700719", "id": "143189512", "title": "ScanPyramids Mission Teaser_English Version"}, {"thumbnail": "503216055", "id": "116754785", "title": "The Beginning Of A DreamTeam by Alexander Tikhomirov (&Jay Alvarrez)"}, {"thumbnail": "503216814", "id": "116735360", "title": "Undeveloped World War II Film Discovered"}, {"thumbnail": "542376633", "id": "144523728", "title": "CHI-RAQ Trailer"}, {"thumbnail": "502224010", "id": "116019668", "title": "Color Reel - The House On Pine Street"}, {"thumbnail": "504549477", "id": "117669654", "title": "The road story Vietnam"}, {"thumbnail": "613799315", "id": "200325511", "title": "For Approval"}, {"thumbnail": "627732742", "id": "211656397", "title": "FlightLapse #01 - MilkyWay"}, {"thumbnail": "598774762", "id": "188693111", "title": "This Journey"}, {"thumbnail": "551004502", "id": "151297208", "title": "Hi\u00c3\u00a9rophante - Clich\u00c3\u00a9s (Official Music Video)"}, {"thumbnail": " by Oskar & Gaspar", "id": "143296099", "title": "Ink Mapping: Video Mapping Projection on Tattoos"}, {"thumbnail": "557254708", "id": "156275939", "title": "StasyQ #175 by Said Energizer"}, {"thumbnail": "583104530", "id": "175929311", "title": "References to 70-80's movies in Stranger Things"}, {"thumbnail": "504881975", "id": "117970959", "title": "Jim and Saab {to infinity and beyond}"}, {"thumbnail": "563778648", "id": "161418954", "title": "Clem Schultz Fairdale Tornado Video"}, {"thumbnail": " Arizona - August 2015", "id": "135811823", "title": "Wet Microburst - Tucson"}, {"thumbnail": "546522854", "id": "147767325", "title": "RECRUITMENT 2016"}, {"thumbnail": "562500734", "id": "160499415", "title": "Jay Rodgers - I Ain't"}, {"thumbnail": "545227738", "id": "145498720", "title": "Freevalve"}, {"thumbnail": "546078021", "id": "147365861", "title": "UNCANNY VALLEY"}, {"thumbnail": "533047782", "id": "137925379", "title": "R O M A"}, {"thumbnail": "541129524", "id": "143524459", "title": "StasyQ #169 by Said Energizer"}, {"thumbnail": "508439234", "id": "120567436", "title": "THE NAKED LIFE - \u00e2\u20ac\u0153How little abstraction can art tolerate?\u00e2\u20ac\u009d (2015)"}, {"thumbnail": "588961985", "id": "180668935", "title": "KENZO WORLD"}, {"thumbnail": "574889996", "id": "169993072", "title": "The Lion City II - Majulah"}, {"thumbnail": "558358093", "id": "157159267", "title": "4 Surfer Girls Wearing Body Paint"}, {"thumbnail": "563854321", "id": "161487817", "title": "RUN and RUN / lyrical school \u00e3\u20ac\u0090MV for Smartphone\u00e3\u20ac\u2018"}, {"thumbnail": "523183194", "id": "131077537", "title": "Pampers Pooface"}, {"thumbnail": "513574179", "id": "124007383", "title": "The Right - A Short Film of Wave Slab Fury from Oz"}, {"thumbnail": "596419456", "id": "185662473", "title": "e-Mobility in the fast lane."}, {"thumbnail": "517195164", "id": "126671316", "title": "Pizza Hut 'Blockbuster Box'"}, {"thumbnail": "508877241", "id": "120879861", "title": "Jalen McMillan Exclusive Interview - Talks Internet Fame & 2015 World Tour"}, {"thumbnail": "584092121", "id": "176370337", "title": "Alan Watts & David Lindberg - Why Your Life Is Not A Journey"}, {"thumbnail": "603476051", "id": "192179727", "title": "Autopilot Full Self-Driving Hardware (Neighborhood Long)"}, {"thumbnail": "599430181", "id": "189015526", "title": "Field of Vision - Best of Luck with the Wall"}, {"thumbnail": "630529034", "id": "196499730", "title": "Gidapwidi - I remember (Official Video)"}, {"thumbnail": "555757723", "id": "155089463", "title": "LITTLE BIG - BIG DICK"}, {"thumbnail": "625508602", "id": "209263699", "title": "\\Rogue One\\ Spliced with \\A New Hope\\"}, {"thumbnail": "517912569", "id": "127209042", "title": "\u00d0\u0178\u00d0\u00b0\u00d1\u20ac\u00d1\u201a\u00d0\u00bd\u00d1\u2018\u00d1\u20ac\u00d1\u0081\u00d0\u00ba\u00d0\u00b0\u00d1\u008f \u00d0\u00bf\u00d1\u20ac\u00d0\u00be\u00d0\u00b3\u00d1\u20ac\u00d0\u00b0\u00d0\u00bc\u00d0\u00bc\u00d0\u00b0 Wargaming Network"}, {"thumbnail": "520672350", "id": "129252030", "title": "\u00d0\u2014\u00d0\u00b5\u00d0\u00bc\u00d1\u201e\u00d0\u00b8\u00d1\u20ac\u00d0\u00b0 - \u00d0\u00a5\u00d0\u00be\u00d1\u2021\u00d0\u00b5\u00d1\u02c6\u00d1\u0152"}, {"thumbnail": "542113293", "id": "124313553", "title": "Celles et Ceux des Cimes et Cieux"}, {"thumbnail": "550666006", "id": "151026015", "title": "Pixar's Tribute to Cinema"}, {"thumbnail": "567042228", "id": "163445850", "title": "A Fighting Chance"}, {"thumbnail": "552727515", "id": "152263079", "title": "B&A HAKA"}, {"thumbnail": " Windy City Nights II", "id": "126726117", "title": "Chicago Timelapse Project"}, {"thumbnail": "565493501", "id": "162803063", "title": "How to Make a Tennis Ball"}, {"thumbnail": "530063844", "id": "116510462", "title": "Ferrolic"}, {"thumbnail": "525838316", "id": "132952244", "title": "Pornhub's Twerking Butt"}, {"thumbnail": "506768514", "id": "119416353", "title": "DRAKE ~ JUNGLE"}, {"thumbnail": "570148251", "id": "166138104", "title": "A New Look for Instagram"}, {"thumbnail": " Du Ciel", "id": "136938394", "title": "Teahupo'o"}, {"thumbnail": "615774874", "id": "201891678", "title": "Walk in my Footsteps"}, {"thumbnail": "516219878", "id": "124858722", "title": "Antarctica"}, {"thumbnail": "603238488", "id": "192009410", "title": "Dyan comes home"}, {"thumbnail": "550311383", "id": "150746445", "title": "\\All I Ask\\ -Adele | Will B. Bell Choreography"}, {"thumbnail": "508207470", "id": "120401488", "title": "POWER/RANGERS (UNAUTHORIZED NSFW BOOTLEG)"}, {"thumbnail": "504341978", "id": "117588730", "title": "Golfing With Ida"}, {"thumbnail": "536511650", "id": "140190277", "title": "Nudist Neptune Festival 2014 in Crimea"}, {"thumbnail": "530922032", "id": "136422430", "title": "Salim & Aysha - Same Day Edit"}, {"thumbnail": "540751779", "id": "143119333", "title": "Paint Stripper"}, {"thumbnail": "594538387", "id": "129364057", "title": "Astrology Zone October 2016"}, {"thumbnail": "573835215", "id": "169137176", "title": "Sinfon\u00c3\u00ada de lo natural"}, {"thumbnail": "546227686", "id": "147527929", "title": "Peaches - Rub (Uncensored)"}, {"thumbnail": "510162913", "id": "117641243", "title": "Tiger Shark Ballet with Vincent Canabal"}, {"thumbnail": "546034621", "id": "125095515", "title": "#INTRODUCTIONS (2015)"}, {"thumbnail": "536616980", "id": "128134468", "title": "Coco de Mer: X"}, {"thumbnail": "515722629", "id": "125574159", "title": "Alisa"}, {"thumbnail": "621889056", "id": "159925523", "title": "The Wedding of London and Nathan // Villa del Sol d'Oro"}, {"thumbnail": "518498681", "id": "126614296", "title": "How to Brew Coffee in an AeroPress"}, {"thumbnail": "595439176", "id": "185625717", "title": "OFFICIAL \\PANTSUIT POWER\\ FLASH MOB FOR HILLARY"}, {"thumbnail": "597595128", "id": "187755684", "title": "FireFan Promo"}, {"thumbnail": "642896442", "id": "223963621", "title": "The Reveal of The Official Sigil Animation of Jesse Millette (20 Second Version)"}, {"thumbnail": "531054164", "id": "136520029", "title": "StasyQ #161 by Said Energizer"}, {"thumbnail": "521264507", "id": "129685757", "title": "Parto Natural Humanizado - YouTube"}, {"thumbnail": "506815128", "id": "119494981", "title": "Why I Dance"}, {"thumbnail": "534323847", "id": "138803941", "title": "LIFE OR DREAM. EUROTRIP (BY ALEXANDER TIKHOMIROV)"}, {"thumbnail": "564511746", "id": "162052542", "title": "Ma'agalim - Jane Bordeaux"}, {"thumbnail": "624750928", "id": "190063150", "title": "Hi Stranger"}, {"thumbnail": "562355500", "id": "160353693", "title": "Ger Farmer Foley"}, {"thumbnail": "555306477", "id": "154727398", "title": "The Simpsons movie references"}, {"thumbnail": "551364081", "id": "132790897", "title": "F*ck That: An Honest Meditation"}, {"thumbnail": "568497486", "id": "128688653", "title": "Serial Metaphysics"}, {"thumbnail": "573971311", "id": "169289500", "title": "ReelSteady Stabilization of Graham Dickinson's Legendary Flight"}, {"thumbnail": "508859700", "id": "120853614", "title": "Parrots of Shuka Vana participate in Hanuman Chalisa Parayana Yagna"}, {"thumbnail": "503078374", "id": "116654583", "title": "Nikon I Am Generation Image: Kordale & Kaleb"}, {"thumbnail": "614280888", "id": "200672866", "title": "BRENDAN MACLEAN // House of Air (NSFW)"}, {"thumbnail": "600474889", "id": "189919038", "title": "UNSATISFYING"}];

var supportsLocalStorage = (function() {
  try {
    window.localStorage.setItem('test', '1');
    window.localStorage.removeItem('test');
    return true;
  }
  catch (error) {
    return false;
  }
})();

function maybeStore(key, value) {
  if (supportsLocalStorage) {
    window.localStorage.setItem(key, value);
  }
}

function shuffle(arr) {
  var currentIndex = arr.length;
  var temporaryValue;
  var randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }

  return arr;
}

function shuffleAndSave() {
  var shuffled = shuffle(db);
  maybeStore('random-db', JSON.stringify(shuffled));
  return shuffled;
}

var localDb = window.localStorage.getItem('random-db');
var randomizedDb = localDb ? JSON.parse(localDb) : shuffleAndSave();

var localStartIndex = parseInt(window.localStorage.getItem('start-index'), 10);

var startIndex = localStartIndex || 0;
function getBatch(size) {
  if (size === 0) { return []; }
  maybeStore('start-index', startIndex);
  var slice = randomizedDb.slice(startIndex, startIndex + size);
  startIndex += size;
  // this wraps to start if you've reached the end
  if (slice.length === 0) {
    startIndex = 0;
    return getBatch(size);
  }
  return slice;
}

var getOne = function () { return getBatch(1)[0]; };

function getRowCount() {
  var rowHeight = 70; // includes padding of single row
  var deadHeight = 70; // button + padding = dead height
  var rows = Math.floor((window.innerHeight - deadHeight) / rowHeight);
  return rows;
}

var state = {
  activeVideoId: window.location.hash.slice(1) || getOne().id,
  videos: getBatch(getRowCount()),
};

var listeners = [];
var subscribe = function (fn) { return listeners.push(fn); };
var notify = function () { return listeners.forEach(function (fn) { return fn(state); }); };

var getRandomItemIndex = function (arr) { return Math.floor(Math.random() * arr.length); };

function pickVideo(i) {
  var video = state.videos[i];
  state.activeVideoId = video.id;
  state.videos[i] = getOne();
  window.location.hash = video.id;
  notify();
}

function pickRandomVideo() {
  pickVideo(getRandomItemIndex(state.videos));
}

function refetch() {
  state.videos = getBatch(getRowCount());
  notify();
}

subscribe(function () { return m.redraw(); });
window.onresize = function () { return m.redraw(); };

window.addEventListener('keyup', function (event) {
  if (event.key === 'n') { pickRandomVideo(); }
  else if (event.key === 'v') { refetch(); }
});

var App = {
  view: function view() {
    return [
      m(Player, { id: state.activeVideoId }),
      m(Sidebar, { videos: state.videos, onSelection: pickVideo },
        m('.button-area',
          m('button', { onclick: refetch }, m('img', { src: '/images/random-icon.svg', height: '14' })),
          m('button.alt', { onclick: pickRandomVideo }, m('u', 'N'), 'ext')
        )
      ) ];
  },
};

var mountNode = document.getElementById('app');
m.mount(mountNode, App);

}(m));
