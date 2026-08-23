import React from 'react';
import FinanceiroPlus from './FinanceiroPlus.jsx';

const CSS = `
.financeiro-enhanced{--fx-purple:#7C3AED;--fx-purple-soft:#F4EEFF;--fx-green:#22A447;--fx-green-soft:#EEF9F0;--fx-orange:#F97316;--fx-orange-soft:#FFF3EA;--fx-blue:#1677FF;--fx-blue-soft:#EEF6FF}
.financeiro-enhanced [style*="cursor: pointer"]{transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
.financeiro-enhanced [style*="cursor: pointer"]:active{transform:scale(.985)}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-landmark),
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-bell),
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-target),
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-upload){position:relative;overflow:hidden;border:1px solid #ECE7F7;box-shadow:0 5px 16px rgba(39,35,67,.06)}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-landmark)::after,
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-bell)::after,
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-target)::after,
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-upload)::after{content:'›';position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:31px;font-weight:500;line-height:1}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-landmark){background:linear-gradient(145deg,#fff,var(--fx-green-soft))!important}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-landmark) svg{color:var(--fx-green)!important;background:#E4F6E8;border-radius:13px;padding:8px;width:44px;height:44px}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-landmark)::after{color:var(--fx-green)}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-bell){background:linear-gradient(145deg,#fff,var(--fx-orange-soft))!important}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-bell) svg{color:var(--fx-orange)!important;background:#FFF0E3;border-radius:13px;padding:8px;width:44px;height:44px}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-bell)::after{color:var(--fx-orange)}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-target){background:linear-gradient(145deg,#fff,var(--fx-purple-soft))!important}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-target) svg{color:var(--fx-purple)!important;background:#EEE6FF;border-radius:13px;padding:8px;width:44px;height:44px}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-target)::after{color:var(--fx-purple)}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-upload){background:linear-gradient(145deg,#fff,var(--fx-blue-soft))!important}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-upload) svg{color:var(--fx-blue)!important;background:#E5F1FF;border-radius:13px;padding:8px;width:44px;height:44px}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-upload)::after{color:var(--fx-blue)}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-target) small{color:var(--fx-purple)!important;font-weight:700}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-upload) small{color:var(--fx-blue)!important;font-weight:700}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-bell) small{color:var(--fx-orange)!important;font-weight:700}
.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-landmark) small{color:var(--fx-green)!important;font-weight:700}
.financeiro-enhanced h1{letter-spacing:-.02em}
.financeiro-enhanced button{font-family:inherit}
.financeiro-enhanced [style*="background: linear-gradient(135deg, rgb(255, 255, 255), rgb(243, 238, 255))"],
.financeiro-enhanced [style*="background:linear-gradient(135deg,#fff,#F3EEFF)"]{border:1px solid #E9DFFF}
@media(max-width:520px){.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-landmark)::after,.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-bell)::after,.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-target)::after,.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-upload)::after{right:12px}.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-landmark) svg,.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-bell) svg,.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-target) svg,.financeiro-enhanced [style*="cursor: pointer"]:has(svg.lucide-upload) svg{width:40px;height:40px}}
`;

export default function Financeiro(props){
  return <div className="financeiro-enhanced"><style>{CSS}</style><FinanceiroPlus {...props}/></div>;
}
