import './globals.css';
import './premium-motion.css';
import MotionSystem from './components/MotionSystem';
import type {Metadata} from 'next';
export const metadata:Metadata={title:{default:'Yardify Landscaping & Construction | Sydney',template:'%s | Yardify'},description:'Landscaping and outdoor construction across Sydney, including retaining walls, decking, turf and outdoor upgrades.',metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://getyardify.com'),openGraph:{title:'Yardify Landscaping & Construction',description:'Landscaping and outdoor construction across Sydney.',type:'website'},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en-AU"><body><MotionSystem />{children}</body></html>}
