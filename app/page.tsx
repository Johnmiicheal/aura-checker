'use client'

import { useEffect, useState, ReactNode, useRef } from 'react'
import { useChat } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from 'lucide-react'
import Marked, { ReactRenderer } from 'marked-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton"

interface Models {
  name: string
  modelId: string
  description: string
  icon: string
}

const models: Models[] = [
  {
    name: "DeepSeek R1 Distill Llama 70b",
    modelId: 'groq:deepseek-r1-distill-llama-70b',
    description: 'Meta Llama 3.3 70b Model',
    icon: '/groq.svg',
  },
  {
    name: 'DeepSeek R1',
    modelId: 'deepseek:deepseek-reasoner',
    description: 'DeepSeek Reasoning Model',
    icon: '/deepseek.svg',
  },
]

const loadingMessages = [
  "Analyzing digital footprint...",
  "Processing social patterns...",
  "Computing compatibility...",
  "Mapping social connections...",
  "Generating insights...",
  "Finalizing report...",
]

const renderer: Partial<ReactRenderer> = {
  heading: (children: ReactNode, level: number) => (
    <h2 className={`text-${level === 1 ? '2xl' : 'xl'} font-medium !text-zinc-100 my-4`}>
      {children}
    </h2>
  ),
  strong: (children: ReactNode) => (
    <strong className="!text-zinc-100 font-semibold">{children}</strong>
  ),
  paragraph: (children: ReactNode) => (
    <p className="text-zinc-300 mb-4 break-words">{children}</p>
  ),
  list: (children: ReactNode, ordered?: boolean) => (
    <ul className={`list-disc pl-4 mb-4 space-y-2 text-zinc-300 ${ordered ? 'list-decimal' : ''}`}>
      {children}
    </ul>
  ),
  listItem: (children: ReactNode) => (
    <li className="text-zinc-300 break-words">{children}</li>
  ),
  table: (children: ReactNode) => (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden rounded-lg border border-zinc-700">
          <table className="min-w-full divide-y divide-zinc-700/50 !m-0">
            {children}
          </table>
        </div>
      </div>
    </div>
  ),
  tableHeader: (children: ReactNode) => (
    <thead className="bg-zinc-800/90 !text-zinc-200">
      {children}
    </thead>
  ),
  tableBody: (children: ReactNode) => (
    <tbody className="divide-y !divide-zinc-700/50">
      {children}
    </tbody>
  ),
  tableRow: (children: ReactNode) => (
    <tr className="transition-colors hover:bg-zinc-700/30">
      {children}
    </tr>
  ),
  tableCell: (children: ReactNode[], flags: { header: boolean }) => (
    flags.header ? (
      <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium tracking-wider !text-zinc-200 uppercase">
        {children}
      </th>
    ) : (
      <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm !text-zinc-200 whitespace-normal break-words">
        {children}
      </td>
    )
  ),
}

export default function Home() {
  const [auraUser, setAuraUser] = useState('')
  const [auraSubject, setAuraSubject] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loadingIdx, setLoadingIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedModel, setSelectedModel] = useState(models[0].modelId)

  const { messages, input, handleInputChange, handleSubmit, setMessages, stop, isLoading } = useChat({
    api: '/api/check-aura',
    body: { auraUser, auraSubject, model: selectedModel }
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    setIsSubmitted(true)
    handleSubmit(e)
  }

  const resetForm = () => {
    stop()
    setAuraUser('')
    setAuraSubject('')
    setIsSubmitted(false)
    setMessages([])
    setLoadingIdx(0)
  }

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingIdx((prev) => (prev + 1) % loadingMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    }
    setLoadingIdx(0)
  }, [isLoading])

  const assistantMessages = messages.filter((m) => m.role === 'assistant')
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]
  const streamingReasoning = lastAssistantMessage?.reasoning || ""
  const result = lastAssistantMessage?.content || ""
  const reasoning = streamingReasoning

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, result])

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center px-4 sm:px-6">
      <section id="app" className="w-full max-w-3xl py-12 sm:py-20">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center">
            <Badge className="inline-block bg-zinc-800 text-zinc-200 text-xs px-3 py-1 rounded-full">
              Powered by <a href="https://exa.ai" target="_blank" rel="noopener noreferrer" className="hover:no-underline text-zinc-200">Exa.AI</a>, <a href="https://deepseek.com" target="_blank" rel="noopener noreferrer" className="hover:no-underline text-zinc-200">DeepSeek LLMs</a> and <a href="https://sdk.vercel.ai" target="_blank" rel="noopener noreferrer" className="hover:no-underline text-zinc-200">Vercel AI SDK</a>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight !text-zinc-100 text-center">
            Aura Checker
          </h1>
          <p className="text-zinc-400 text-lg text-center">
            Compare your <strong className="!text-zinc-100">Aura</strong> with X(Twitter) posts.
          </p>

          <div className="w-full">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="input-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/60 p-4 sm:p-6 pt-2 space-y-4 sm:space-y-6 rounded-lg">
                    <form
                      onSubmit={onSubmit}
                      className="space-y-4 sm:space-y-5"
                    >
                      <div className="flex justify-end w-fit">
                        <Select
                          value={selectedModel}
                          onValueChange={setSelectedModel}
                        >
                          <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs text-zinc-400">
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent className="min-w-[200px] bg-zinc-800 border-zinc-700">
                            {models.map((model) => (
                              <SelectItem
                                key={model.modelId}
                                value={model.modelId}
                                className="text-zinc-300 hover:bg-zinc-700"
                              >
                                <div className="flex items-center space-x-2">
                                  <Image
                                    src={model.icon}
                                    alt={model.name}
                                    width={14}
                                    height={14}
                                    className="rounded-full"
                                  />
                                  <span className="text-xs">{model.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Input
                        placeholder="Your X(Twitter) @username"
                        value={auraUser}
                        onChange={(e) => setAuraUser(e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700/60 text-zinc-200 h-12 sm:h-11 text-base sm:text-sm"
                        aria-label="Your X(Twitter) username"
                      />

                      <Input
                        placeholder="Their X(Twitter) @username"
                        value={auraSubject}
                        onChange={(e) => setAuraSubject(e.target.value)}
                        className="bg-zinc-800/50 border-zinc-700/60 text-zinc-200 h-12 sm:h-11 text-base sm:text-sm"
                        aria-label="Their X(Twitter) username"
                      />

                      <Textarea
                        placeholder="Describe anything you may have in common..."
                        value={input}
                        onChange={handleInputChange}
                        className="bg-zinc-800/50 border-zinc-700/60 text-zinc-200 min-h-[120px] resize-none text-base sm:text-sm"
                        aria-label="Describe your situation"
                      />

                      <Button
                        type="submit"
                        disabled={!auraUser || !auraSubject || !input.trim()}
                        className="w-full bg-zinc-200 text-zinc-900 hover:bg-zinc-300 h-12 sm:h-11 text-base sm:text-sm"
                      >
                        {isLoading ? 'Processing...' : 'Generate Aura Report'}
                      </Button>
                    </form>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-zinc-800/40 backdrop-blur-md border-zinc-700/20 p-3 sm:p-6 rounded-lg">
                    {!result ? (
                      <>
                        <div className="border-b border-zinc-700/20 pb-4 mb-4 flex items-center">
                          <Skeleton className="h-8 w-[140px] mr-4" />
                          <p className="text-zinc-400 text-sm animate-pulse">
                            {loadingMessages[loadingIdx]}
                          </p>
                        </div>
                        <div className="space-y-6">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-[90%]" />
                          <Skeleton className="h-4 w-[95%]" />
                          <Skeleton className="h-20 w-full rounded-lg" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-[92%]" />
                          <Skeleton className="h-4 w-[88%]" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="border-b border-zinc-700/20 px-2 sm:px-6 pb-4 flex flex-col mx-auto justify-center items-center">
                          <h2 className="text-xl font-medium !text-zinc-100 text-center">
                            Aura Compatibility Report
                          </h2>
                          <div className="flex items-center gap-2 text-sm text-zinc-400 mt-2 flex-wrap justify-center">
                            <span className="px-3 py-1.5 bg-zinc-900/50 rounded-full border border-zinc-700/60">
                              @{auraUser}
                            </span>
                            <span className="text-zinc-500">×</span>
                            <span className="px-3 py-1.5 bg-zinc-900/50 rounded-full border border-zinc-700/60">
                              @{auraSubject}
                            </span>
                          </div>
                        </div>
                        <ScrollArea className="h-auto">
                          <div className="p-2 sm:p-6">
                            <div className="space-y-6">
                              {reasoning && (
                                <Accordion
                                  collapsible
                                  type="single"
                                  defaultValue="reasoning"
                                  className="mb-8 max-w-full sm:max-w-2xl"
                                >
                                  <AccordionItem
                                    value="reasoning"
                                    className="border-none rounded-lg bg-zinc-800/40 backdrop-blur-sm"
                                  >
                                    <AccordionTrigger className="w-full flex items-center justify-between p-4 text-sm font-medium !text-zinc-100 hover:bg-zinc-800/40 rounded-lg transition-all hover:no-underline">
                                      AI Reasoning Process
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-1 max-w-full sm:max-w-2xl">
                                      <div className="prose prose-sm sm:prose prose-invert prose-zinc w-full break-words">
                                        <Marked value={reasoning} renderer={renderer} />
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              )}

                              {result && (
                                <div className="prose prose-sm sm:prose prose-invert prose-zinc max-w-full sm:max-w-2xl px-2 break-words">
                                  <Marked value={result} renderer={renderer} />
                                </div>
                              )}
                            </div>
                            <div ref={scrollRef} />
                          </div>
                        </ScrollArea>
                        <div className="mt-8 pt-6 border-t border-zinc-700/20 flex justify-center">
                          <Button
                            onClick={resetForm}
                            variant="ghost"
                            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Start Over
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isSubmitted && (
            <div className="w-full max-w-3xl space-y-8 mt-12">
              <p className="text-zinc-400 text-lg text-center">
                Powered by Exa for post analysis, DeepSeek for vibe matching, and Vercel AI SDK for real-time <strong className="!text-zinc-100">Aura Points</strong>.
              </p>

              <Accordion type="single" collapsible className="w-full space-y-2 sm:space-y-3">
                <AccordionItem
                  value="what"
                  className="border-none rounded-lg bg-zinc-800/40 backdrop-blur-sm data-[state=open]:bg-zinc-800/60 transition-colors"
                >
                  <AccordionTrigger className="w-full flex items-center justify-between p-4 text-sm font-medium !text-zinc-100 hover:bg-zinc-700/40 rounded-lg transition-all hover:no-underline">
                    What We Do
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 text-sm text-zinc-400">
                    <div className="space-y-2">
                      We use Exa to analyze X posts, DeepSeek for vibe matching, and Vercel AI SDK for streaming real-time <strong className="!text-zinc-100">Aura Points</strong>. Get instant insights into your digital energy alignment.
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="how"
                  className="border-none rounded-lg bg-zinc-800/40 backdrop-blur-sm data-[state=open]:bg-zinc-800/60 transition-colors"
                >
                  <AccordionTrigger className="w-full flex items-center justify-between p-4 text-sm font-medium !text-zinc-100 hover:bg-zinc-700/40 rounded-lg transition-all hover:no-underline">
                    How It Works
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 text-sm text-zinc-400">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-600">1.</span>
                        <span>Exa fetches and analyzes your recent X posts and interactions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-600">2.</span>
                        <span>DeepSeek processes the vibe match and calculates compatibility</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-600">3.</span>
                        <span>Vercel AI SDK streams your real-time <strong className="!text-zinc-100">Aura Points</strong> analysis</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-600">4.</span>
                        <span>Get detailed insights about your digital energy alignment</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="features"
                  className="border-none rounded-lg bg-zinc-800/40 backdrop-blur-sm data-[state=open]:bg-zinc-800/60 transition-colors"
                >
                  <AccordionTrigger className="w-full flex items-center justify-between p-4 text-sm font-medium !text-zinc-100 hover:bg-zinc-700/40 rounded-lg transition-all hover:no-underline">
                    Features
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1 text-sm text-zinc-400">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3">
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        <span>Smart X post analysis powered by Exa&apos;s search technology</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        <span>Advanced vibe matching with DeepSeek&apos;s language models</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        <span>Real-time streaming responses with Vercel AI SDK</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-1 w-1 rounded-full bg-zinc-600" />
                        <span>Comprehensive digital aura analysis and compatibility scoring</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                <div className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/60 p-6 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer">
                  <h3 className="!text-zinc-100 font-medium mb-2">Post Analysis</h3>
                  <p className="text-zinc-400 text-sm">
                    Exa&apos;s technology analyzes X posts to understand your digital presence and energy.
                  </p>
                </div>
                <div className="bg-zinc-800/50 backdrop-blur-sm border-zinc-700/60 p-6 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer">
                  <h3 className="!text-zinc-100 font-medium mb-2">Real-time Results</h3>
                  <p className="text-zinc-400 text-sm">
                    Instant vibe matching and compatibility scoring with DeepSeek and Vercel AI SDK.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="w-full max-w-3xl py-12 border-t border-zinc-700/60">
        <div className="text-center text-zinc-400 px-4">
          <p>Crafted with 💖 to help Gen-Z discover and balance their digital aura</p>
        </div>
      </footer>
    </div>
  )
}