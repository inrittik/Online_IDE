import React, { useEffect, useRef, useState } from "react";
import { initSocket } from "../socket";
import { ACTIONS } from "../Actions";
import Codemirror from "codemirror";
import { differenceInMilliseconds } from "date-fns";
import Console from "../components/Console";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/lib/codemirror.css";

// languages
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";
import "codemirror/mode/dart/dart";
import "codemirror/mode/go/go";

// themes
import "codemirror/theme/dracula.css";
// import "codemirror/theme/monokai.css";
// import "codemirror/theme/3024-day.css";
// import "codemirror/theme/base16-light.css";

const languages = [
  {
    lang: "C",
    mode: "clike",
    extension: "c",
    value: `#include<stdio.h>
    
int main(){
    printf("Hello World!");
    return 0;
}`,
  },
  {
    lang: "C++",
    mode: "clike",
    extension: "cpp",
    value: `#include<iostream>
    
using namespace std;

int main(){
    cout<<"Hello World"<<endl;
    return 0;
}`,
  },
  {
    lang: "Java",
    mode: "clike",
    extension: "java",
    value: `// Class with the main function should be named "HelloWorld"
class HelloWorld{ 

    public static void main(String[] args){
        System.out.println("Hello World!");
    }
}`,
  },
  {
    lang: "Python",
    mode: "python",
    extension: "py",
    value: `print("Hello World!")`,
  },
  {
    lang: "Javascript",
    mode: "javascript",
    extension: "js",
    value: `console.log("Hello World!")`,
  },
];

const Editor = () => {
  const [lang, setLang] = useState(0);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(true);
  const [executionTime, setExecutionTime] = useState(0);

  const editor = useRef(null);

  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      // socketRef.current.emit(ACTIONS.JOIN)

      socketRef.current.on(
        ACTIONS.RETURN,
        ({ success, output, startedAt, endedAt }) => {
          if (success) {
            setOutput(output);
            setSuccess(true);
            const startDate = new Date(startedAt);
            const endDate = new Date(endedAt);
            setExecutionTime(differenceInMilliseconds(endDate, startDate));
          } else {
            setOutput(output.stderr);
            setSuccess(false);
          }
          setLoading(false);
        }
      );
    };
    init();
  }, []);

  useEffect(() => {
    function init() {
      editor.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          mode: "clike",
          theme: "dracula",
        }
      );
    }
    init();
  }, []);

  useEffect(() => {
    editor.current.setOption("mode", languages[lang].mode);
    editor.current.setValue(languages[lang].value);

    // console.log(editor.current);
  }, [lang]);

  const handleLanguageChange = (e) => {
    setLang(e.target.value);
  };

  const handleRun = () => {
    setOutput("");
    setLoading(true);
    socketRef.current.emit(ACTIONS.RUN, {
      code: editor.current.getValue(),
      extension: languages[lang].extension,
    });
  };
  return (
    <div className="ide_space">
      <div className="editorOptions">
        <div className="language">
          <label htmlFor="lang">Language:</label>

          <select id="lang" onChange={handleLanguageChange}>
            {languages.map((language, idx) => {
              return <option value={idx}>{language.lang}</option>;
            })}
          </select>
        </div>

        <button className="run" onClick={handleRun}>
          ▶️ Run
        </button>
      </div>

      <textarea id="realtimeEditor"></textarea>
      <Console
        output={output}
        loading={loading}
        success={success}
        executionTime={executionTime}
      />
    </div>
  );
};

export default Editor;
