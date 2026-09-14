import Link from 'next/link';

const photos = [
  {pos:'0% 0%', label:'Completed landscape'},
  {pos:'100% 0%', label:'Pathway transformation'},
  {pos:'0% 50%', label:'Front garden'},
  {pos:'100% 50%', label:'Stepping-stone pathway'},
  {pos:'0% 100%', label:'Pool landscape'},
  {pos:'100% 100%', label:'Retaining wall'},
];

export default function Home(){
  return <>
    <header className="nav">
      <div className="wrap navIn">
        <a className="brand" href="#top"><img src="/images/yardify-logo.webp" alt="Yardify Landscaping Construction" /></a>
        <nav className="links"><a href="#services">Services</a><a href="#work">Our Work</a><a href="#process">Process</a><a href="#about">About</a></nav>
        <Link className="btn dark" href="#quote">Get a free quote</Link>
      </div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="heroImage" />
        <div className="heroOverlay" />
        <div className="wrap heroIn">
          <p className="eyebrow">Yardify Landscaping & Construction · Sydney</p>
          <h1 className="serif">OUTDOOR SPACES <i>BUILT TO BE LIVED IN.</i></h1>
          <p className="lead">Landscaping and outdoor construction for Sydney homes — from retaining walls and turf to pathways, gardens and outdoor upgrades.</p>
          <div className="actions"><Link className="btn lime" href="#quote">Get my free quote</Link><a className="btn outline" href="#work">View our work</a></div>
        </div>
      </section>

      <section className="section" id="services"><div className="wrap">
        <p className="eyebrow light">Services</p><h2 className="serif bigTitle">Practical work. <i>Clean finish.</i></h2>
        <p className="muted intro">Yardify Landscaping & Construction provides tailored outdoor solutions for homes and businesses.</p>
        <div className="grid4">{[['01','Retaining Walls','Create usable levels and define outdoor spaces with practical retaining solutions.'],['02','Decking','Extend the way you use your home with a considered outdoor living space.'],['03','Turf & Lawn','A cleaner, greener finish for outdoor areas that need to work hard.'],['04','Outdoor Upgrades','Improve an existing outdoor area with practical landscaping upgrades.']].map(([n,t,d])=><article className="card" key={n}><span className="num">{n}</span><h3>{t}</h3><p className="muted">{d}</p></article>)}</div>
      </div></section>

      <section className="work" id="work"><div className="wrap section">
        <p className="eyebrow light">Our Work</p><h2 className="serif bigTitle">Real outdoor spaces. <i>Real results.</i></h2>
        <div className="gallery">{photos.map((p,i)=><div className={"photo "+(i===0?'featured':'')} key={p.label} style={{backgroundImage:"url('/images/yardify-portfolio.webp')",backgroundPosition:p.pos}}><span>{p.label}</span></div>)}</div>
      </div></section>

      <section className="section" id="about"><div className="wrap standard">
        <div><p className="eyebrow light">The Yardify Standard</p><h2 className="serif bigTitle">A straightforward approach to outdoor work.</h2></div>
        <div className="points">{['Clean work','Proficient','Customer Satisfaction','Tailored Solutions'].map((x,i)=><div className="point" key={x}><span className="num">0{i+1}</span><h3>{x}</h3><p className="muted">Focused on a considered, practical result for the property and project scope.</p></div>)}</div>
      </div></section>

      <section className="review"><div className="quote"><p className="eyebrow light">Verified Feedback</p><blockquote>“Responsive with messages … really reliable … work was done with care and left the area clean.”</blockquote><p className="muted">Verified customer · hipages</p></div></section>

      <section className="section" id="process"><div className="wrap">
        <p className="eyebrow light">Process</p><h2 className="serif bigTitle">From first enquiry to finished space.</h2>
        <div className="process">{[['01','Enquire','Tell us about your suburb, service and project.'],['02','Review','We assess the project brief and available details.'],['03','Build','Move from project scope into the appropriate next step.']].map(([n,t,d])=><div className="step" key={n}><span className="num">{n}</span><h3>{t}</h3><p className="muted">{d}</p></div>)}</div>
      </div></section>

      <section className="cta" id="quote"><div className="wrap ctaIn">
        <p className="eyebrow">Start Your Project</p><h2 className="serif">Tell us about the space.</h2><p className="ctaLead">Send a project enquiry and Yardify can review the details with you.</p>
        <form className="form" action="mailto:yardify@example.com" method="post" encType="text/plain"><input className="field" required name="Name" placeholder="Full name"/><input className="field" required name="Phone" placeholder="Mobile number"/><input className="field" name="Suburb" placeholder="Suburb"/><input className="field" name="Service" placeholder="Service required"/><textarea className="field area" name="Project" placeholder="Tell us about your project"/><button className="btn lime" type="submit">Send project enquiry</button></form>
      </div></section>
    </main>
    <footer><img src="/images/yardify-logo.webp" alt="" /> YARDIFY LANDSCAPING & CONSTRUCTION · SYDNEY</footer>
  </>
}