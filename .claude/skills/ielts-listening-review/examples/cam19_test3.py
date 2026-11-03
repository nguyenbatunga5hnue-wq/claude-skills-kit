"""Cambridge IELTS 19, Listening Test 3: content for build_deck.py.

Copy this file for a new test and replace the content. Rules:
- SEQUENCE must follow the audio order (the aligner walks forward through the recording).
- Every script line must be the words actually spoken (check against the transcript),
  because each line is located in the audio by matching its words.
- Markup inside script lines:  K(..) answer · T(..) trap/distractor · P(..) paraphrase of
  the question wording · [[word|alt]] a blank the class fills in (matching slides only) ·
  TAG('k'|'t'|'p', text) a small label shown after the answer is revealed.
"""
K = lambda s: '<mark class="k">' + s + '</mark>'
T = lambda s: '<mark class="t">' + s + '</mark>'
P = lambda s: '<mark class="p">' + s + '</mark>'
TAG = lambda k, s: f'<span class="tag {k}">{s}</span>'

META = {"title": "Cambridge 19 · Listening Test 3", "cover": "Cambridge 19<br>Listening Test 3"}

# English examples used by the animated pyramid (take them from this test)
PYR_EX = {
 "t2": {"label": "Part 1, câu 2", "chunk": "go over the bridge", "card": "<b>go over the bridge</b> = <b>cross the bridge</b> → nghe ra cả cụm, không dịch từng chữ"},
 "t3": {"label": "Part 1, câu 3", "sentence": "It doesn’t close until four.", "card": "= Cửa hàng <b>mở đến 4 giờ</b>. Hiểu cả câu, chứ không chỉ nghe thấy số “4”."},
 "t4": {"label": "Part 1, câu 8", "wrong": "mango", "right": "melon", "card": "“How about a mango?” – “They’re not always ripe. I’d prefer a melon.” Nhớ cả đoạn mới không chọn nhầm."},
 "t5": {"label": "Bài giảng Part 4", "notes": ["microplastics ← clothes (wash), tyres", "harm: mouths ✗ · digestion ✗", "soil ← air, rain, fertilisers"],
        "audio": "damaging their mouths", "test": "injuries to the mouths"},
}

GAP_GROUPS=[
 {"id":"p1a","part":"Part 1","title":"Questions 1–6 · Local food shops","note":"ONE WORD AND/OR A NUMBER",
  "heading":"Local food shops",
  "qs":[
   {"n":1,"pre":"<b>Where to go</b><br>Kite Place – near the","post":"","ans":"harbour","alt":"harbor",
    "clue":"near = <i>the area by</i>","trap":"Viết harbour hoặc harbor đều được; hay sai chính tả.",
    "lines":[("A","Yes, I am. My cousins are coming to stay for a couple of days and I have to cook for them."),
             ("S","Well, there are plenty of places to buy food in Kite Place. It’s "+P("the area by")+" the "+K("harbour")+".")]},
   {"n":2,"pre":"<b>Fish market</b><br>cross the","post":"and turn right","ans":"bridge",
    "clue":"cross = <i>go over</i>; turn right = <i>it’s on the right</i>","trap":"",
    "lines":[("A","Oh great, where is it exactly?"),
             ("S","It’s at the far end of Kite Place. So you have to "+P("go over")+" the "+K("bridge")+" and then it’s "+P("on the right")+".")]},
   {"n":3,"pre":"best to go before","post":"pm, earlier than closing time","ans":"3.30","alt":"three thirty|3:30",
    "clue":"before = <i>get there by</i>","trap":"4 là giờ đóng cửa (đề đã nói “earlier than closing time”); 11 là giờ hiện tại.",
    "lines":[("A","Okay, is it open all day?"),
             ("S","It doesn’t close until "+T("4")+", but I’d recommend going earlier than that. It does run out of some things."),
             ("A","Oh, I don’t want that to happen."),
             ("S","As long as you "+P("get there by")+" "+K("three thirty")+", you should be fine."),
             ("A","It’s only "+T("11")+" now, so plenty of time.")]},
   {"n":4,"pre":"<b>Organic shop</b><br>called ‘","post":"’","ans":"Rose",
    "clue":"called = <i>what’s it called… the name of a flower</i>","trap":"Viết hoa tên riêng: Rose.",
    "lines":[("S","There’s a really nice organic shop there."),("A","Now what’s it called?"),
             ("S","It’s the name of a flower… I know, it’s "+K("Rose")+".")]},
   {"n":5,"pre":"below a restaurant in the large, grey building<br>look for the large","post":"outside","ans":"sign",
    "clue":"large = <i>big</i>; outside = <i>on the pavement</i>","trap":"Chữ “large, grey building” xuất hiện trước, đừng điền “building”.",
    "lines":[("S","As you reach the market, you’ll see a "+P("big grey building")+" on your left. I think it used to be a warehouse. Anyway, now it’s a restaurant upstairs."),
             ("S","The ground floor has two shops either side of the entrance, and it’s the one on the left."),
             ("S","You can’t miss it. There’s also a "+P("big")+" "+K("sign")+" "+P("on the pavement")+", so you can look for that.")]},
   {"n":6,"pre":"<b>Supermarket</b><br>take a","post":"minibus, number 289","ans":"purple",
    "clue":"number 289 đã cho sẵn → nghe màu/loại xe","trap":"289 có sẵn trên đề, không phải đáp án.",
    "lines":[("S","You should be able to get everything you need, but there’s a minibus that goes to the supermarket if you need it."),
             ("S","It’s "+K("purple")+" and the number is "+T("289")+".")]},
  ]},
 {"id":"p1b","part":"Part 1","title":"Questions 7–10 · Shopping","note":"ONE WORD ONLY","heading":"Shopping",
  "qs":[
   {"n":7,"pre":"<b>Fish market</b> · a dozen prawns<br>Other ideas: a handful of","post":"(type of seaweed)","ans":"samphire",
    "clue":"type of seaweed; a dozen = <i>twelve</i>","trap":"salmon, shellfish, prawns đều được nhắc; từ lạ phải nghe đánh vần S-A-M-P-H-I-R-E.",
    "lines":[("S","So what do you need to get at the fish market?"),
             ("A","The "+T("salmon")+" is always very good, and the "+T("shellfish")+". I’m going to make a curry, I think, and I need about "+P("twelve prawns")+" for that."),
             ("S","They will have plenty of those. Okay. Have you ever tried "+K("samphire")+"?"),
             ("A","No, what’s that?"),
             ("S","It’s "+P("a type of seaweed")+". I just ask for "+P("a handful")+" and you fry it in butter. It’s delicious."),
             ("A","Oh, I might try that. How do you spell it?"),
             ("S","It’s "+K("S-A-M-P-H-I-R-E")+".")]},
   {"n":8,"pre":"<b>Organic shop</b> · beans and a","post":"for dessert","ans":"melon",
    "clue":"for dessert","trap":"Bẫy sửa lại: mango được gợi ý rồi bị gạt (“not always ripe”).",
    "lines":[("A","I’ll see what beans they have in the organic shop, and I think I’ll get something "+P("for dessert")+" there."),
             ("S","How about a "+T("mango")+"?"),
             ("A","I’m not sure. They’re not always ripe. I’d prefer a "+K("melon")+", it’s bigger too.")]},
   {"n":9,"pre":"Other ideas: spices and","post":"","ans":"coconut",
    "clue":"spices đã cho → nghe “and things like…”","trap":"",
    "lines":[("S","Good idea. The owner also sells a lot of "+P("spices")+" there that you can put in a curry, and things like "+K("coconut")+".")]},
   {"n":10,"pre":"<b>Bakery</b> · a brown loaf<br>Other ideas: a","post":"tart","ans":"strawberry",
    "clue":"brown loaf = <i>brown bread</i>; tart","trap":"chocolate cake bị bác bỏ (“Well, not that”). Cake ≠ tart.",
    "lines":[("A","I know bread doesn’t really go with curry, but I always like to have some in case."),
             ("S","All the bread is homemade and there’s lots of variety. I like the "+P("brown bread")+" myself."),
             ("A","Mmm, sounds good."),("S","They sell other things there too, like cakes."),
             ("A","I love "+T("chocolate")+" cake!"),
             ("S","Well, not that, but they have a whole range of "+P("tarts")+", and the best are the "+K("strawberry")+" ones.")]},
  ]},
 {"id":"p4a","part":"Part 4","title":"Questions 31–35 · Microplastics","note":"ONE WORD ONLY","heading":"Microplastics",
  "qs":[
   {"n":31,"pre":"<b>Where microplastics come from</b><br>fibres from some","post":"during washing","ans":"clothing",
    "clue":"fibres = <i>threads and microfibres</i>; washing = <i>washing machine</i>","trap":"",
    "lines":[("L","Microplastics can enter the environment via a number of different sources. "+P("Threads and microfibres")+" detach from synthetic "+K("clothing")+" every time they’re put in a "+P("washing machine")+", and these find their way into the water system.")]},
   {"n":32,"pre":"<b>Effects</b> · They cause injuries to the","post":"of wildlife and affect their digestive systems.","ans":"mouths",
    "clue":"injuries = <i>damaging</i>; wildlife = <i>small creatures</i>","trap":"Số nhiều: mouths.",
    "lines":[("L","There is evidence that microplastics harm "+P("small creatures")+" in a variety of ways, such as by "+P("damaging")+" their "+K("mouths")+", or by impairing their ability to feed, for example when microplastics get lodged in their "+P("digestive system")+".")]},
   {"n":33,"pre":"They enter the food chain, e.g. in bottled and tap water,","post":"and seafood.","ans":"salt",
    "clue":"bottled water, tap … seafood: đáp án nằm giữa danh sách","trap":"",
    "lines":[("L","…as these have been detected in a wide range of food and drink products, including "+P("bottled water")+", as well as in water that comes direct from "+P("the tap")+"."),
             ("L","What’s more, "+K("salt")+" and many kinds of "+P("seafood")+" have also been found to contain microplastics.")]},
   {"n":34,"pre":"…already banned in skin cleaning products and","post":"in some countries.","ans":"toothpaste",
    "clue":"skin cleaning products = <i>shower gels, facial cleansers</i>; banned = <i>legislation which prevents</i>","trap":"shower gels, facial cleansers chính là “skin cleaning products” đã có trên đề.",
    "lines":[("L","However, it’s important to underline that there is not yet conclusive proof that microplastics cause significant harm to people."),
             ("L","In many countries, including here in the UK, there is "+P("legislation which prevents")+" manufacturers from adding plastic microbeads to "+T("shower gels, facial cleansers")+" and "+K("toothpaste")+".")]},
   {"n":35,"pre":"Microplastics enter the soil through the air, rain and","post":"","ans":"fertilisers","alt":"fertilizers",
    "clue":"air, rain … → nghe “What’s more”","trap":"Nhớ số nhiều: fertilisers.",
    "lines":[("L","But we do know they are carried in "+P("the air")+" and deposited in the soil by "+P("rain")+"."),
             ("L","What’s more, many of the "+K("fertilisers")+" used by both farmers and gardeners contain microplastics.")]},
  ]},
 {"id":"p4b","part":"Part 4","title":"Questions 36–40 · Earthworm study","note":"ONE WORD ONLY","heading":"Microplastics in the soil – Anglia Ruskin University",
  "qs":[
   {"n":36,"pre":"Earthworms are important because they add","post":"to the soil.","ans":"nutrients",
    "clue":"add = <i>mix … into it</i>","trap":"fertile là tính từ, không điền được.",
    "lines":[("L","These worms, which live in topsoil, are an essential component of our agricultural system. By feeding on soil, they "+P("mix")+" "+K("nutrients")+" "+P("into it")+", thereby making it more "+T("fertile")+".")]},
   {"n":37,"pre":"The study aimed to find whether microplastics in earthworms affect the","post":"of plants.","ans":"growth",
    "clue":"affect = <i>impact / inhibit</i>; of plants = <i>plant …</i>","trap":"soil quality là của đất, không phải của cây.",
    "lines":[("L","The researchers set out to discover whether the introduction of microplastics into the soil, and the subsequent ingestion of these by earthworms, would impact "+T("soil quality")+" and ultimately "+P("inhibit")+" plant "+K("growth")+".")]},
   {"n":38,"pre":"The study found that microplastics caused:<br>–","post":"loss in earthworms","ans":"weight",
    "clue":"loss = <i>lost</i>","trap":"",
    "lines":[("L","The short answer was, yes, it did. After placing three different types of microplastic particles into the soil, they planted perennial ryegrass."),
             ("L","The result was that the worms "+P("lost")+" "+K("weight")+" rapidly.")]},
   {"n":39,"pre":"– fewer seeds to germinate<br>– a rise in the level of","post":"in the soil.","ans":"acid",
    "clue":"rise = <i>increase</i>; level = <i>amount</i>","trap":"",
    "lines":[("L","What’s more, a lower percentage than normal of the ryegrass seeds "+P("germinated")+"…"),
             ("L","The team also discovered there was an "+P("increase in the amount of")+" "+K("acid")+" found in the soil, and this was attributed mainly to the microplastic particles from conventional HDPE plastic.")]},
   {"n":40,"pre":"The study concluded: soil should be seen as an important natural process; changes to soil damage both ecosystems and","post":"","ans":"society",
    "clue":"both … and = <i>not only … but also</i>; damage = <i>negatively impacted</i>","trap":"",
    "lines":[("L","To summarise, the authors propose the idea that we need to regard soil as we would regard any other "+P("process in nature")+"."),
             ("L","That is, when soil becomes impoverished by the presence of microplastics, "+P("not only")+" ecosystems, "+P("but also")+" the whole of "+K("society")+" are "+P("negatively impacted")+".")]},
  ]},
]

# option: (letter, text, ok, order(1-based or 0 = not mentioned), line index where mentioned, quote, why)
MCQ_GROUPS=[
 {"id":"p2mc","part":"Part 2","title":"Questions 17–20 · Chọn 2 đáp án","short":"Q17–20","qs":[
  {"n":"17–18","stem":"Which TWO <span class='clue'>reasons</span> does the speaker give for <span class='clue'>recommending</span> <i>Alive and Kicking</i>?",
   "cluenote":"Nghe lý do KHEN cuốn sách. Câu chê hoặc phủ định thì loại.",
   "lines":[("P","I’m just wondering if you have a favourite book you could recommend for our readers."),
            ("J","It’s hard to choose, but Alive and Kicking is definitely worth mentioning. "+T("You won’t have heard of the writer")+", as it’s her first book, which is really impressive."),
            ("J","It’s basically the teenage diary of a boy from Somalia who comes to live in the UK. It deals with the "+K("serious issue")+" of immigration,"),
            ("J","all the challenges the boy has to face at school, and with the language barrier, etc."),
            ("J","Usually books like this are quite sad. This one actually made me "+K("cry with laughter")+"."),
            ("J","On each page, there are simple but hilarious "+T("black and white")+" stick drawings of the boy with his friends and teachers."),
            ("J","And at the end of each diary entry, there are new English words the boy learns each day, which may help develop some children’s vocabulary.")],
   "opts":[("A","It will appeal to both boys and girls.",False,0,None,"","Không được nhắc đến."),
           ("B","The author is well known.",False,1,1,"You won’t have heard of the writer","Ngược lại: tác giả mới, sách đầu tay."),
           ("C","It has colourful illustrations.",False,4,5,"black and white stick drawings","Có tranh, nhưng đen trắng."),
           ("D","It is funny.",True,3,4,"made me cry with laughter","cry with laughter = funny"),
           ("E","It deals with an important topic.",True,2,2,"the serious issue of immigration","serious issue = important topic")]},
  {"n":"19–20","stem":"Which TWO pieces of <span class='clue'>advice</span> does the speaker give to <span class='clue'>parents</span> about reading?",
   "cluenote":"Nghe lời khuyên: let them…, it’s good to…, you can… Câu “This is a mistake” là phủ định.",
   "lines":[("P","What about any advice for parents on how to encourage their children to read more?"),
            ("J","Well, this is something I get asked about a lot. There are so many distractions for kids these days that it can be hard to find time for reading."),
            ("J","One thing I’d say is to make time to sit down with your child and share books with them."),
            ("J","A lot of parents "+T("give up reading aloud")+" to their children "+T("as soon as they learn to read independently")+". This is a mistake."),
            ("J","It’s good to read more advanced books to them, as it helps to develop their "+T("vocabulary")+"."),
            ("J","If you don’t have time for this, then "+K("let them listen to audiobooks")+". Often they’ll want to read books they’ve listened to for themselves."),
            ("J","I think it’s a good idea to make a mental note of the type of books your child is reading. Often they just read "+T("the same genre")+" all the time, which can get a bit boring."),
            ("J","You can introduce new authors and genres to them. "+K("Librarians")+" should be able to help you with this.")],
   "opts":[("A","Encourage children to write down new vocabulary.",False,2,4,"helps to develop their vocabulary","Có “vocabulary” nhưng không ai bảo viết ra."),
           ("B","Allow children to listen to audio books.",True,3,5,"let them listen to audiobooks","let = allow"),
           ("C","Get recommendations from librarians.",True,5,7,"Librarians should be able to help you","help you = recommend authors and genres"),
           ("D","Give children a choice about what they read.",False,4,6,"they just read the same genre","Ngược lại: bố mẹ giới thiệu thể loại mới."),
           ("E","Only read aloud to children until they can read independently.",False,1,3,"This is a mistake","Bị phủ định.")]},
 ]},
 {"id":"p3mc","part":"Part 3","title":"Questions 21–25 · Science experiment for Year 12","short":"Q21–25","qs":[
  {"n":21,"stem":"How does <span class='clue'>Clare feel</span> about the students in her Year 12 science class?",
   "cluenote":"Nghe cảm xúc của Clare: từ chỉ cảm xúc (depressing…) và lý do.",
   "lines":[("C","Hi Jake, how are you getting on with the practical teaching?"),
            ("J","It’s harder than I expected, but I’ve got some great classes. How about you?"),
            ("C","Not brilliant. I’m really struggling with my Year 12 science class."),
            ("J","Are they hard to control?"),
            ("C","Well, "+T("I don’t have discipline problems")+" as such. It’s just that they "+K("don’t seem to think that science has anything to do with their lives")+". It’s depressing."),
            ("C","They listen to what I say, and I gave them a test last week and "+T("the results weren’t too bad")+", but there’s "+K("no real engagement")+".")],
   "opts":[("A","worried that they are not making progress",False,3,5,"the results weren’t too bad","Kết quả vẫn ổn."),
           ("B","challenged by their poor behaviour in class",False,1,4,"I don’t have discipline problems","Bị phủ định."),
           ("C","frustrated at their lack of interest in the subject",True,2,4,"no real engagement · it’s depressing","lack of interest = no real engagement")]},
  {"n":22,"stem":"How does <span class='clue'>Jake react</span> to Clare’s suggestion about an experiment based on <span class='clue'>children’s diet</span>?",
   "cluenote":"Ý tưởng là của Clare; nghe Jake phản hồi, chú ý “but”.",
   "lines":[("C","I was wondering about something on the children’s diets, you know, asking them to record what they eat and maybe linking it to their state of health."),
            ("J","Let’s think. So your methodology would involve the children recording what they eat. Okay, but you’d also need to have "+K("access to the children’s medical records")+", and I don’t think people would be happy about that."),
            ("J","Confidentiality would be an issue. If you could get the right data, "+T("the conclusions might be significant")+", but I suspect it’s just "+K("not going to be easy")+".")],
   "opts":[("A","He is concerned that the results might not be meaningful.",False,2,2,"the conclusions might be significant","Ngược lại: kết luận có ý nghĩa."),
           ("B","He feels some of the data might be difficult to obtain.",True,1,1,"access to the medical records… not going to be easy","difficult to obtain = not easy to get access"),
           ("C","He suspects that the conclusions might be upsetting.",False,0,None,"","“upsetting” chỉ xuất hiện ở câu sau (động vật).")]},
  {"n":23,"stem":"What <span class='clue'>problem</span> do they <span class='clue'>agree</span> may be involved in an experiment involving <span class='clue'>animals</span>?",
   "cluenote":"“agree”: cần một người nêu và người kia đồng ý (“No, that’s true”).",
   "lines":[("J","Right. Have you thought about doing an experiment using animals?"),
            ("C","Wouldn’t that be "+T("upsetting for the children")+"?"),
            ("J","Well, the animals don’t have to be harmed in any way. It could just be an experiment where they’re given a certain diet and the effects are observed."),
            ("C","Would I have to get permission to use animals?"),
            ("J","Yes, you’d have to submit an outline of the experiment and fill in a form, but "+T("it’s quite straightforward")+"."),
            ("C","But if we found out that, say, a particular diet affects the health of animals, the same thing "+K("wouldn’t necessarily be true for people")+", would it?"),
            ("J",K("No, that’s true")+", but the findings for any experiment are going to be limited. It’s inevitable.")],
   "opts":[("A","Any results may not apply to humans.",True,3,5,"wouldn’t necessarily be true for people – No, that’s true","not apply to humans = not true for people"),
           ("B","It may be complicated to get permission.",False,2,4,"it’s quite straightforward","Bị phủ định."),
           ("C","Students may not be happy about animal experiments.",False,1,1,"Wouldn’t that be upsetting…?","Jake trả lời: động vật không bị hại.")]},
  {"n":24,"stem":"What <span class='clue'>question</span> do they <span class='clue'>decide</span> the experiment should address?",
   "cluenote":"“decide”: nghe ý cuối cùng được chốt (“In fact…” → “Exactly”).",
   "lines":[("J","Okay, so what will your experiment be investigating exactly?"),
            ("C","Well, something to do with nutrition, so maybe we could look at "+T("food supplements")+", things like extra iron and extra protein and their impact on health."),
            ("J","Mm, "+T("that might be rather broad")+". Maybe just look at the effects of one supplement, like "+T("sugar")+", on the health of the mice."),
            ("C","In fact, maybe the focus could be on "+K("whether mice can control their own diet")+"."),
            ("J","So, what happens when they have access to more sugar that they don’t really need?"),
            ("C",K("Exactly")+". Do they eat it or do they decide to leave it?")],
   "opts":[("A","Are mice capable of controlling their food intake?",True,3,3,"whether mice can control their own diet → Exactly","control food intake = control their own diet"),
           ("B","Does an increase in sugar lead to health problems?",False,2,2,"like sugar, on the health of the mice","Ý trung gian, bị thay bằng “In fact…”."),
           ("C","How much do supplements of different kinds affect health?",False,1,1,"that might be rather broad","Bị bác: quá rộng.")]},
  {"n":25,"stem":"Clare might <span class='clue'>also consider</span> doing <span class='clue'>another experiment</span> involving",
   "cluenote":"“might also consider”: nghe Clare nói “I might think about that”.",
   "lines":[("J","Great. Then later on you could do a follow-up experiment adding another variable. Like you could give some of the mice the chance to be "+K("more active")+", running on a wheel or something, and the others just sit around and don’t do much."),
            ("C","Or I could repeat the experiment but change "+T("the type of food")+" I provided, or use mice with "+T("a different genetic structure")+"."),
            ("C","But I think "+K("your idea would be more interesting")+". I might think about that some more.")],
   "opts":[("A","other types of food supplement.",False,2,1,"change the type of food","Clare tự nêu rồi gạt đi."),
           ("B","different genetic strains of mice.",False,3,1,"a different genetic structure","Clare tự nêu rồi gạt đi."),
           ("C","varying amounts of exercise.",True,1,0,"more active, running on a wheel → your idea would be more interesting","more active = exercise")]},
 ]},
]


MATCH_GROUPS = [
 {"id": "p2m", "part": "Part 2", "title": "Questions 11–16 · Matching", "kind": "list",
  "question": "What information is given about each festival workshop?",
  "box": [("A", "involves painting and drawing"), ("B", "will be led by a prize-winning author"), ("C", "is aimed at children with a disability"),
          ("D", "involves a drama activity"), ("E", "focuses on new relationships"), ("F", "is aimed at a specific age group"),
          ("G", "explores an unhappy feeling"), ("H", "raises awareness of a particular culture")],
  "items": [(11, "Superheroes", "C"), (12, "Just do it", "D"), (13, "Count on me", "F"), (14, "Speak up", "G"), (15, "Jump for joy", "B"), (16, "Sticks and stones", "H")],
  "round1": "Chỉ nghe. Trên đề, gạch chân từ khoá của A–H và viết đáp án tạm bằng bút chì. Xong bấm <b>Lần 2: script khuyết</b>.",
  "lines": [
   ("11", "First of all, there’s a very special event called <b>Superheroes</b>. This is a chance for [[deaf]] children to share their reading experiences with author Madeline Gordon, who is herself " + P("hearing impaired") + "." + TAG("k", "C · deaf = disability")),
   ("12", "<b>Just Do It</b> is a practical workshop led by the well-known [[illustrator]] Mark Keene. He’ll take participants on a magical journey to faraway lands, with an opportunity for aspiring actors to do some [[role play|role-play]]." + TAG("t", "illustrator ≠ A") + TAG("k", "D · role play = drama")),
   ("13", "<b>Count on Me</b> is an inspiring and entertaining look at the issues of [[friendship]] for [[13 to 14|thirteen to fourteen]] year olds. It looks at some of the friendships described in popular books, and asks participants to compare these with their own experiences." + TAG("t", "friendship ≠ new relationships") + TAG("k", "F · age group")),
   ("14", "<b>Speak Up</b> is part of a series of workshops on the subject of mental health. This is a creative writing workshop, encouraging children to describe situations where young people experience [[loneliness]]. A recent survey revealed that children can be lonely even when they’re at home with their families." + TAG("k", "G · loneliness = unhappy feeling")),
   ("15", "<b>Jump for Joy</b>, as many of you will know, is the heartwarming, best-selling story by Nina Karan about a young girl’s trip to visit her relatives in " + T("India") + ". It recently received the [[gold medal]] at the Waterford Awards. Nina will get children to celebrate the word ‘joy’ by writing a poem." + TAG("t", "India ≠ H") + TAG("k", "B · Gold Medal = prize-winning")),
   ("16", "<b>Sticks and Stones</b> is the beautifully " + T("illustrated") + " picture book for young readers about a community who organised an African-Caribbean festival to help local children learn about their [[Jamaican]] roots. This will be a musical event where children will have the chance to play steel drums." + TAG("t", "illustrated ≠ A") + TAG("k", "H · culture")),
  ]},
 {"id": "p3m", "part": "Part 3", "title": "Questions 26–30 · Flowchart", "kind": "flow",
  "box": [("A", "size"), ("B", "escape"), ("C", "age"), ("D", "water"), ("E", "cereal"), ("F", "calculations"), ("G", "changes"), ("H", "colour")],
  "items": [(26, "Choose mice which are all the same", "", "C", "age"),
            (27, "Divide the mice into two groups, each with a different", "", "H", "colour"),
            (28, "Put each group in a separate cage. Feed group A commercial mouse food. Feed group B the same, but also sugar contained in", "", "E", "cereal"),
            (29, "Take measurements using an electronic scale. Place them in a weighing chamber to prevent", "", "B", "escape"),
            (30, "Do all necessary", "", "F", "calculations")],
  "round1": "Chỉ nghe, đi theo từng ô của flowchart. Mỗi ô ghi 1 từ nghe được. Xong bấm <b>Lần 2: script khuyết</b>.",
  "lines": [
   ("C", "So can I talk through a possible procedure for the experiment where mice are given a sugar supplement?"),
   ("J", "Sure. I did a similar experiment in college, actually."),
   ("C", "Great! So how many mice would I need?"),
   ("J", "I’d say about 12. And all [[young]] ones, not a mixture of old and young." + TAG("k", "26 C · age")),
   ("C", "Okay, and I’d need two groups of equal " + T("sizes") + ", so six in each group." + TAG("t", "size ≠ 26") + " And how would I tell them apart?"),
   ("J", "I suppose I could put some sort of tag on one group, or just mark them in some way. You could use food [[colouring|coloring]]. That wouldn’t hurt them." + TAG("k", "27 H · colour")),
   ("C", "Perfect. Then each group would go into a separate cage, and one group, let’s call them group A, would be the control group, so they’d just have ordinary mouse food. I suppose you can buy that."),
   ("J", "Yes, it comes in dry pellets."),
   ("C", "And the other group would have the same as the first group, but they’d also have the extra sugar."),
   ("J", "Would you just give them " + T("straight sugar") + "? It might be better to give them something like [[cereal]] with it." + TAG("k", "28 E")),
   ("C", "Then you’d need to weigh the mice, I should think, once a week, and you’d need an electronic balance. But we can’t hold them on the balance or it’d affect the reading."),
   ("J", "Exactly. So you need something called a weighing chamber to stop the mice from [[running away]]." + TAG("k", "29 B · escape") + " It sounds complicated, but actually you can just use a plastic box with holes in the top."),
   ("C", "Okay, so once we’ve measured the weight gain of each mouse, we can work out the [[average]] for each group, as well as the [[standard deviation]], and then see where we go from there." + TAG("k", "30 F · calculations")),
  ]},
]

EXTRA_HTML = {
 "traps1": '''<section class="slide" data-title="Bẫy Part 1">
  <div class="hdr"><h2>Bốn kiểu bẫy vừa gặp</h2></div>
  <div class="tipgrid" style="grid-template-columns:repeat(4,1fr)">
    <div class="c"><h3>Sửa lại / đổi ý</h3><p><i>mango</i> → “not always ripe” → <b>melon</b></p><p class="sub">Nghe tiếp sau đáp án đầu tiên. Tín hiệu: <i>I’m not sure, actually, I’d prefer, rather</i>.</p></div>
    <div class="c"><h3>Hai con số</h3><p>close at <i>4</i>, it’s <i>11</i> now → <b>3.30</b></p><p class="sub">Hỏi lại mình: số này trả lời câu hỏi nào? Đề ghi “earlier than closing time”.</p></div>
    <div class="c"><h3>Liệt kê gây nhiễu</h3><p><i>salmon, shellfish, prawns</i> → <b>samphire</b>; <i>chocolate cake</i> → <b>strawberry</b> tart</p><p class="sub">Từ khoá trong đề (seaweed, tart) mới là mốc.</p></div>
    <div class="c"><h3>Đề đã cho sẵn</h3><p>number <i>289</i>, <i>a dozen</i> prawns</p><p class="sub">Thông tin in sẵn trên đề là mốc để biết mình đang ở đâu, không phải đáp án.</p></div>
  </div>
</section>''',
 "tips": '''<section class="slide" data-title="Take notes">
  <div class="hdr"><h2>Ghi chú như thế này, không chép nguyên câu</h2></div>
  <div class="tipgrid">
    <div class="c"><h3>1 · Trước khi nghe</h3><ul><li>Gạch 1–2 từ khoá mỗi lựa chọn: <i>painting, prize, disability, drama, new relat., age, unhappy, culture</i></li><li>Đoán trước từ đồng nghĩa: disability → <i>deaf, blind</i>; drama → <i>act, role play</i></li></ul></div>
    <div class="c"><h3>2 · Trong khi nghe</h3><ul><li>Mỗi tên workshop là một mốc: nghe tên → mở “ngăn” mới</li><li>Ghi 1–2 từ, dùng ký hiệu</li><li>Thấy từ trùng với đề (illustrator, India) thì cẩn thận: thường là bẫy</li></ul></div>
    <div class="c"><h3>3 · Mẫu ghi chú</h3>
<div class="notesample">Superh.  deaf ch. → C
Just do  illustr.(✗A) / role play → D
Count    friendship(✗E) 13–14 → F
Speak    lonely → G
Jump     India(✗H) GOLD medal → B
Sticks   Jamaican roots → H</div></div>
  </div>
</section>''',
}

HOMEWORK = [
 ("Tầng 2–3", "var(--t3)", "Chép chính tả Part 1", "Nghe lại đoạn Q7–10, chép từng câu đến khi đủ. Chú ý đánh vần S-A-M-P-H-I-R-E và các số."),
 ("Tầng 4", "var(--t4)", "Retell Part 2", "Nghe đoạn Q11–16 một lần, tắt audio, nói lại 6 workshop trong 1 phút bằng tiếng Anh."),
 ("Tầng 5", "var(--t5)", "Tóm tắt Part 4", "Nghe bài giảng về microplastics, ghi chú bằng ký hiệu, viết tóm tắt 80–100 từ, rồi so với transcript."),
]

# blocks in AUDIO order: ("title", text) · ("gap", id) · ("mcq", id) · ("match", id) · ("html", key)
SEQUENCE = [
 ("title", "Part 1"), ("gap", "p1a"), ("gap", "p1b"), ("html", "traps1"),
 ("title", "Part 2"), ("match", "p2m"), ("html", "tips"), ("mcq", "p2mc"),
 ("title", "Part 3"), ("mcq", "p3mc"), ("match", "p3m"),
 ("title", "Part 4"), ("gap", "p4a"), ("gap", "p4b"),
]
