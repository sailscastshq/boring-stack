# Ascent React - The Boring SaaS Stack 🚀

**Ship products with battle-tested technologies. Say no to chasing JavaScript trends.**

Ascent React is the ultimate free React SaaS template built on The Boring JavaScript Stack. Focus on shipping to actual real users instead of wrestling with complex build tools and trendy frameworks.

## 🎁 The Boring Stack Philosophy

- 🎯 **Focus on Your Product** - Effortlessly focus on what really matters: shipping to actual real users
- 🙅🏾‍♀️ **No API Required** - Each page receives the necessary data as props from your Sails backend
- 🤝 **Battle-Tested Technologies** - Built with reliable, proven technologies that just work
- 🚀 **Ship Fast** - Iterate quickly and move easily from MVP to scale

## ✨ What's Included

### Core Stack

- ⚡ **Sails.js** - Robust MVC framework for Node.js
- ⚛️ **React 19** - Latest React with modern features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🔄 **Inertia.js** - Modern monolith approach (no API needed!)
- 🎯 **PrimeReact** - Rich UI component library with 80+ components

### SaaS Essentials (Coming Soon)

- 🔐 **Authentication** - OAuth, Magic Links, and 2FA
- 📝 **Waitlist** - Built-in waitlist functionality
- 💳 **Lemon Squeezy** - Subscription payments integration
- 📧 **Transactional Email** - Email templates and delivery
- 👥 **Multi-tenancy/Teams** - Team management system
- 📊 **Admin Dashboard** - Powered by Sails Nexus
- 📰 **Content Blog** - SEO-friendly blog system

## 🚀 Quick Start

```bash
npm install
npx sails lift
```

Visit `http://localhost:1337` to see your application running!

## 🎨 UI Components with PrimeReact

Build beautiful interfaces quickly with PrimeReact + Tailwind CSS:

```jsx
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Card } from 'primereact/card'

function LoginForm() {
  return (
    <Card className="mx-auto mt-8 w-96">
      <div className="space-y-4 p-6">
        <h2 className="text-center text-2xl font-bold">Welcome Back</h2>
        <InputText placeholder="Enter your email" className="w-full" />
        <Button label="Sign In" className="w-full" severity="info" />
      </div>
    </Card>
  )
}
```

## 📚 Learn More

- [The Boring Stack Docs](https://docs.sailscasts.com/boring-stack)
- [Sails.js Documentation](https://sailsjs.com/documentation)
- [PrimeReact Components](https://primereact.org)
- [Inertia.js Guide](https://inertiajs.com)

---

_Built with ❤️ by [The Sailscasts Company](https://sailscasts.com) - Part of [The Boring Stack](https://github.com/sailscastshq/boring-stack)_
