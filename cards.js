// The first four IDs are stable so existing collections keep their meaning.
// Four watercolor illustrations are shared across related notes; every card
// has its own title and message. Image data is embedded during the HTML build.
export const artwork = [
  '/*__CARD1__*/', // hug
  '/*__CARD2__*/', // walk
  '/*__CARD3__*/', // tea
  '/*__CARD4__*/', // flowers
];

const notes = [
  { title: '拥抱', text: '妈妈，我只想与你\n长久地拥抱。', art: 0 },
  { title: '陪伴', text: '小时候你牵着我，\n以后换我陪着你。', art: 1 },
  { title: '休息', text: '今天也辛苦啦，\n记得照顾自己。', art: 2 },
  { title: '花', text: '妈妈也值得收到\n很多爱。', art: 3 },
  { title: '呼吸', text: '妈妈，先跟我慢慢呼吸。\n别急着把所有事都做好。', art: 2 },
  { title: '坐一会儿', text: '累了就坐一会儿。\n我陪你，什么都不做也可以。', art: 0 },
  { title: '已经很好', text: '还有事没做完也没关系。\n你已经努力了一整天。', art: 1 },
  { title: '说给我听', text: '心里有点委屈的话，\n不用忍着，讲给我听吧。', art: 0 },
  { title: '等天晴', text: '今天如果像下雨，\n我们就一起等云慢慢散开。', art: 1 },
  { title: '晚安', text: '晚上的事交给枕头。\n妈妈，先安心睡一觉。', art: 0 },
  { title: '好好吃饭', text: '忙的时候也要记得吃饭。\n我想让你被好好照顾。', art: 2 },
  { title: '平凡日子', text: '平凡的一天里，\n有你，就是我喜欢的日子。', art: 3 },
  { title: '小失误', text: '做错一件小事，\n不会减少我对你的爱。', art: 0 },
  { title: '慢慢走', text: '走慢一点也没关系。\n我会配合你的脚步。', art: 1 },
  { title: '我看见你', text: '妈妈的善良和认真，\n我一直都看在眼里。', art: 3 },
  { title: '不孤单', text: '如果你觉得孤单，\n就来小屋坐坐，我在这里。', art: 0 },
  { title: '先照顾自己', text: '今天也可以先照顾自己。\n你不必答应每一个人。', art: 3 },
  { title: '暖茶', text: '让热茶暖一暖手心，\n也给心留一点温度。', art: 2 },
  { title: '一点轻松', text: '明天不用完美。\n有一点点轻松就很好。', art: 1 },
  { title: '回家', text: '不管今天过得怎么样，\n回到这里就可以休息。', art: 3 },
];

export const cards = notes.map(note => ({ ...note, image: artwork[note.art] }));
export const CARD_COUNT = cards.length;
